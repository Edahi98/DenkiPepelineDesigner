import type { Node, Edge } from "reactflow";
import type { AstNodeData } from "../types/ast_types";
import { buildBinaryOpChain, type ChainOp } from "./ast_wrappers";
import { BOOLEAN_MASK_SERIES_TYPES, SERIES_NODE_TYPES } from "../algoritmos/series_types";

/**
 * Expression-building utilities shared by `graph_builder.ts`.
 *
 * DF-level serialization (turning a whole canvas into a pipeline or
 * graph document) used to live in this file too (`buildDFNode`,
 * `buildPipelineFromEnd`, `flowToPipeline`) as an independent,
 * hand-duplicated copy of what `dag_builder.ts` already did for the
 * DAG contract. That duplication is gone: `graph_builder.ts` is now
 * the single serializer, for both "Exportar JSON" and "Ejecutar". This
 * file keeps only what is genuinely reusable across both: building an
 * `ExprNode` subtree (`buildExpr`), and Series-chain handling.
 */

/** Extract a property from a buildExpr result (which is a { type, ... } object). */
export function propertiesToAttr(obj: any, key: string): any {
    if (!obj || typeof obj !== "object") return undefined;
    if (key in obj) return obj[key];
    // The properties object is the step itself minus "type", so
    // we can look up the key directly on the object.
    return obj[key];
}

export function buildExpr(nodeId: string, nodes: Node<AstNodeData>[], edges: Edge[]): any {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const type = node.data.nodeType;
    const properties = { ...node.data.properties };

    // Find children expressions (outgoing edges)
    const childEdges = edges.filter(e => e.source === nodeId);
    const children = childEdges
        .map(e => nodes.find(n => n.id === e.target))
        .filter((n): n is Node<AstNodeData> => !!n && n.data.isExpression);

    const getExpr = (targetNodeId: string) => buildExpr(targetNodeId, nodes, edges);

    if (type === "col") {
        return { type: "col", name: properties.name || "" };
    }

    if (type === "lit") {
        let val = properties.value;
        if (properties.dtype === "Int32" || properties.dtype === "Int64") {
            const num = parseInt(val, 10);
            if (!isNaN(num)) val = num;
        } else if (properties.dtype === "Float32" || properties.dtype === "Float64") {
            const num = parseFloat(val);
            if (!isNaN(num)) val = num;
        } else if (properties.dtype === "Boolean") {
            val = val === "true" || val === true || val === "True";
        }
        return {
            type: "lit",
            value: val,
            dtype: properties.dtype || null,
        };
    }

    if (type === "binary") {
        const sortedChildren = [...children].sort((a, b) => a.position.x - b.position.x);
        return {
            type: "binary",
            op: properties.op || "",
            left: sortedChildren[0] ? getExpr(sortedChildren[0].id) : null,
            right: sortedChildren[1] ? getExpr(sortedChildren[1].id) : null,
        };
    }

    if (type === "append") {
        const otherChildId = edges.find(e => e.source === nodeId && e.sourceHandle === "other")?.target;
        return {
            type: "append",
            other: otherChildId ? getExpr(otherChildId) : properties.other,
            upcast: properties.upcast !== undefined ? !!properties.upcast : true,
        };
    }

    if (type === "unary") {
        return {
            type: "unary",
            op: properties.op || "",
            operand: children[0] ? getExpr(children[0].id) : null,
        };
    }

    if (type === "call") {
        let argsVal = properties.args || {};
        if (typeof argsVal === "string") {
            try {
                argsVal = JSON.parse(argsVal);
            } catch (e) {}
        }
        return {
            type: "call",
            method: properties.method || "",
            on: children[0] ? getExpr(children[0].id) : null,
            args: argsVal,
        };
    }

    if (type === "alias") {
        return {
            type: "alias",
            name: properties.name || "",
            expr: children[0] ? getExpr(children[0].id) : null,
        };
    }

    if (type === "cast") {
        return {
            type: "cast",
            expr: children[0] ? getExpr(children[0].id) : null,
            dtype: properties.dtype || "",
            strict: properties.strict !== undefined ? !!properties.strict : true,
        };
    }

    if (type === "over") {
        let partVal = properties.partition_by || [];
        if (typeof partVal === "string") {
            try {
                partVal = JSON.parse(partVal);
            } catch (e) {}
        }
        return {
            type: "over",
            expr: children[0] ? getExpr(children[0].id) : null,
            partition_by: partVal,
        };
    }

    if (type === "sort_expr") {
        return {
            type: "sort_expr",
            expr: children[0] ? getExpr(children[0].id) : null,
            descending: !!properties.descending,
            nulls_last: !!properties.nulls_last,
        };
    }

    if (type === "when") {
        const sortedChildren = [...children].sort((a, b) => a.position.x - b.position.x);
        return {
            type: "when",
            condition: sortedChildren[0] ? getExpr(sortedChildren[0].id) : null,
            then: sortedChildren[1] ? getExpr(sortedChildren[1].id) : null,
            otherwise: sortedChildren[2] ? getExpr(sortedChildren[2].id) : null,
        };
    }

    if (type === "chain") {
        // Resolve operands in left-to-right order (by x position) so
        // the user controls the grouping on the canvas.
        const op = ((properties.op as string) === "&" ? "&" : "|") as ChainOp;
        const sortedChildren = [...children].sort(
            (a, b) => a.position.x - b.position.x,
        );
        if (sortedChildren.length < 2) {
            throw new Error(
                "El nodo Chain requiere al menos 2 operandos conectados.",
            );
        }
        const operands = sortedChildren.map((c) => getExpr(c.id));
        return buildBinaryOpChain(op, operands) as any;
    }

    return { type, ...properties };
}

/**
 * Detects if a node is a Series AST node (not a DataFrame AST expression).
 * Series nodes are all expression nodes except the traditional DataFrame expressions.
 */
export function isSeriesNode(node: Node<AstNodeData>): boolean {
    if (!node.data.isExpression) {
        return false;
    }
    return SERIES_NODE_TYPES.has(node.data.nodeType);
}

/**
 * The real DataFrame connected to a `get_column`'s dedicated bridge
 * handle (`SERIES_EXTRA_TARGETS.get_column` in AstNodeCard.tsx), the
 * one field name `DF_EDGE_KEYS`/`SERIES_SECONDARY_EDGE_KEYS` in
 * Tsubasa's `parser.py` ever wires it through. Only `get_column` ever
 * has this edge — every other Series node's `df_source`-shaped input
 * is rejected by Tsubasa's parser.
 */
export function findDfBridgeSourceId(nodeId: string, nodes: Node<AstNodeData>[], edges: Edge[]): string | undefined {
    const e = edges.find(edge => edge.target === nodeId && edge.targetHandle === "df_source");
    if (!e) return undefined;
    const src = nodes.find(n => n.id === e.source);
    return src && !src.data.isExpression ? e.source : undefined;
}

/**
 * Canonicalises the edges around `combine_conditions`, so that neither
 * which handle a condition was dropped on nor which way round the edge
 * was drawn changes what the canvas means.
 *
 * A Boolean-mask node adjacent to a `combine_conditions` is one of its
 * conditions — there is no other role it can play. Applying a boolean
 * predicate *to* a boolean mask is meaningless, and the chain input
 * exists only so conditions can borrow a column to evaluate against,
 * which no Boolean node provides. So every such edge is rewritten to the
 * canonical `condition -> combine_conditions` on `cond_in`.
 *
 * Direction is the whole meaning between two `combine_conditions` nodes
 * (which one is the outer?), so those edges are left exactly as drawn.
 *
 * Rewriting the edge list up front means every traversal — leaf
 * detection, `seriesChainIds`, `buildSeriesChain` — sees one shape and
 * none of them needs its own special case. It also fixes leaf detection
 * for free: a condition drawn hanging off the node's *output* used to
 * have no outgoing edge of its own and so counted as a chain terminal,
 * turning each condition into a separate graph output while leaving
 * `combine_conditions` itself with an empty `conditions` list.
 */
export function normalizeCombineConditionEdges(
    nodes: Node<AstNodeData>[],
    edges: Edge[],
): Edge[] {
    const typeOf = (id: string) => nodes.find(n => n.id === id)?.data.nodeType;
    const isCombine = (id: string) => typeOf(id) === "combine_conditions";
    const isMask = (id: string) => {
        const t = typeOf(id);
        return !!t && t !== "combine_conditions" && BOOLEAN_MASK_SERIES_TYPES.has(t);
    };

    return edges.map(e => {
        if (isCombine(e.source) && isMask(e.target)) {
            return {
                ...e,
                source: e.target,
                target: e.source,
                sourceHandle: "dataflow-out",
                targetHandle: "cond_in",
            };
        }
        if (isCombine(e.target) && isMask(e.source) && e.targetHandle !== "cond_in") {
            return { ...e, targetHandle: "cond_in" };
        }
        return e;
    });
}

/**
 * Splits a Series node's incoming edges into the single main-chain link
 * that continues the chain, the `combine_conditions` conditions, and the
 * remaining handle-addressed parameters (`append`'s "other",
 * `series_filter`'s "predicate", ...).
 *
 * For every node type the *handle* decides: an edge on `expr-in` (or the
 * legacy `dataflow-in`, or none at all) continues the chain, anything
 * else names a parameter.
 *
 * `combine_conditions` is the deliberate exception, where the *kind* of
 * the incoming node decides instead. Its two inputs — the chain link on
 * the left and "conds" on top — are trivially easy to swap on the canvas,
 * and both mis-drops used to fail silently or unrecognisably: a condition
 * landing on the chain input was discarded outright (only one edge is
 * ever read from there), and the chain link landing on "conds" turned the
 * whole node into `pl.lit(True)` or made Polars complain about filtering
 * strings by strings, several nodes away from the actual mistake. Since a
 * Boolean-mask node is only ever a condition, and the chain input exists
 * solely so conditions can borrow a column to evaluate against — a role no
 * Boolean node can fill — the classification is unambiguous without the
 * handle, so the handle is not consulted. Drop the edges wherever they
 * land; the meaning is the same.
 *
 * `seriesChainRoot` here and `seriesChainIds` in `dag_builder.ts` both
 * thread the chain through this function, so the ids and the serialized
 * steps cannot disagree about a node's shape.
 */
export function classifySeriesInputs(
    nodeId: string,
    nodes: Node<AstNodeData>[],
    edges: Edge[],
): { mainEdge?: Edge; condEdges: Edge[]; paramEdges: Edge[] } {
    const srcNode = (e: Edge) => nodes.find(n => n.id === e.source);
    const fromSeries = edges.filter(e => {
        if (e.target !== nodeId) return false;
        const src = srcNode(e);
        return !!src && isSeriesNode(src);
    });
    const isMask = (e: Edge) => {
        const src = srcNode(e);
        return !!src && BOOLEAN_MASK_SERIES_TYPES.has(src.data.nodeType);
    };

    const nodeType = nodes.find(n => n.id === nodeId)?.data.nodeType;

    if (nodeType === "combine_conditions") {
        // Left-to-right canvas order, so `NOT` (which uses conditions[0])
        // and any future order-sensitive operator are deterministic.
        const byPosition = (a: Edge, b: Edge) => {
            const na = srcNode(a)!, nb = srcNode(b)!;
            return na.position.x - nb.position.x || na.position.y - nb.position.y;
        };
        return {
            mainEdge: fromSeries.filter(e => !isMask(e))[0],
            condEdges: fromSeries.filter(isMask).sort(byPosition),
            paramEdges: [],
        };
    }

    const isChainLink = (e: Edge) =>
        !e.targetHandle || e.targetHandle === "expr-in" || e.targetHandle === "dataflow-in";
    let mainEdge = fromSeries.find(isChainLink);
    let paramEdges = fromSeries.filter(e => !isChainLink(e));

    // series_filter's `pred` handle sits a few pixels from its chain input, and
    // a chain link dropped on it is recorded faithfully as `predicate` - the
    // edge is visibly drawn, so nothing looks wrong. A predicate has to be a
    // Boolean mask, so a non-Boolean node there can only ever be the series
    // *being* filtered, and is dropped as a predicate either way:
    //   - nothing on the chain input: it *is* the chain link, so promote it.
    //     Otherwise the chain has no root and fails far away as a
    //     ColumnNotFound against a synthetic stub.
    //   - something already on the chain input, often that same node: the edge
    //     was redrawn onto the right handle without the old one being deleted.
    //     Keeping the leftover guarantees `chain.filter(chain)`.
    // A Boolean node on `pred` is left exactly as drawn.
    if (nodeType === "series_filter") {
        const misplaced = paramEdges.filter(e => e.targetHandle === "predicate" && !isMask(e));
        if (misplaced.length > 0) {
            paramEdges = paramEdges.filter(e => !misplaced.includes(e));
            if (!mainEdge) mainEdge = misplaced[0];
        }
    }

    return { mainEdge, condEdges: [], paramEdges };
}

/** Walks a Series chain's "main chain" link (the same one `buildSeriesChain`
 * threads) backward from `nodeId` to find its root. */
export function seriesChainRoot(nodeId: string, nodes: Node<AstNodeData>[], edges: Edge[]): string {
    let currentId = nodeId;
    const seen = new Set<string>();
    while (!seen.has(currentId)) {
        seen.add(currentId);
        const { mainEdge } = classifySeriesInputs(currentId, nodes, edges);
        if (!mainEdge) break;
        currentId = mainEdge.source;
    }
    return currentId;
}

/**
 * Builds a Series chain from a chain of connected Series nodes.
 * Traverses from the end node backwards through the chain.
 *
 * `externalRefs`, when passed, opts a *secondary* series-valued field
 * (`append.other`, `is_in.values_series`, `contains_any.patterns_series`)
 * into promotion instead of inline embedding whenever its own chain
 * bridges a real, independent DataFrame (its root has a `df_source`
 * edge) — inline embedding has no field to carry that bridge at all
 * (`GetColumnNode.from_json` ignores a nested `df_source` key), so an
 * inline-embedded cross-DataFrame operand silently loses which
 * DataFrame it came from and falls back to the host's own frame. The
 * field is set to that chain's root id (a plain string) instead of a
 * nested object; the caller (`GraphDocumentBuilder.addSeriesNode`) is
 * responsible for registering every collected id as its own flat graph
 * node — this function only collects, it never touches `nodesById`.
 * Self-contained operands (`from_list`/`from_scalar`) or ones sharing
 * the host's own frame keep embedding inline exactly as before, and
 * omitting `externalRefs` entirely preserves the old always-inline
 * behavior for every other caller.
 */
export function buildSeriesChain(
    endNodeId: string,
    nodes: Node<AstNodeData>[],
    edges: Edge[],
    externalRefs?: Set<string>,
): any[] {
    const chain: any[] = [];
    let currentNodeId: string | null = endNodeId;
    const visited = new Set<string>();

    while (currentNodeId && !visited.has(currentNodeId)) {
        visited.add(currentNodeId);
        const node = nodes.find(n => n.id === currentNodeId);
        if (!node || !isSeriesNode(node)) break;

        const stepJson: any = { type: node.data.nodeType, ...node.data.properties };
        delete stepJson.expr;
        delete stepJson.source;
        chain.unshift(stepJson);

        // Split this node's incoming Series edges into the chain link, the
        // conditions, and the named parameters (other, predicate, ...).
        const { mainEdge, condEdges, paramEdges } = classifySeriesInputs(currentNodeId, nodes, edges);

        for (const edge of paramEdges) {
            const handle = edge.targetHandle as string;
            if (externalRefs) {
                const rootId = seriesChainRoot(edge.source, nodes, edges);
                if (findDfBridgeSourceId(rootId, nodes, edges) !== undefined) {
                    stepJson[handle] = edge.source;
                    externalRefs.add(edge.source);
                    continue;
                }
            }
            const subchain = buildSeriesChain(edge.source, nodes, edges, externalRefs);
            if (subchain.length > 0) {
                stepJson[handle] = subchain.length === 1 ? subchain[0] : {
                    type: "extract_series_chain",
                    chain: subchain
                };
            }
        }
        // Serialize the conditions as a single "conditions" array.
        // Same externalRefs promotion as other secondary fields: when a condition's
        // chain root bridges a real DataFrame, store the chain's terminal id as a
        // string reference so the df_source link is preserved in the flat graph.
        if (condEdges.length > 0) {
            const conditionsArr: any[] = [];
            for (const condEdge of condEdges) {
                const condSource = condEdge.source;
                if (externalRefs) {
                    const rootId = seriesChainRoot(condSource, nodes, edges);
                    if (findDfBridgeSourceId(rootId, nodes, edges) !== undefined) {
                        conditionsArr.push(condSource);
                        externalRefs.add(condSource);
                        continue;
                    }
                }
                const subchain = buildSeriesChain(condSource, nodes, edges, externalRefs);
                if (subchain.length > 0) {
                    conditionsArr.push(subchain.length === 1 ? subchain[0] : {
                        type: "extract_series_chain",
                        chain: subchain
                    });
                }
            }
            if (conditionsArr.length > 0) stepJson.conditions = conditionsArr;
        }

        currentNodeId = mainEdge ? mainEdge.source : null;
    }

    return chain;
}

/**
 * Resolves an outgoing expression-port edge target to its AST node: a
 * plain `ExprNode` via `buildExpr`, or — when the target is a Series
 * node — the chain wrapped as `{"type": "series_chain", "chain": [...]}`,
 * the shape Tsubasa's `parser.py` (`parse_expr`'s `series_chain` case)
 * expects.
 *
 * An outgoing edge from a DF op (e.g. `with_columns`'s "expr" port)
 * lands on the Series chain's *root* (`get_column`), not its terminal,
 * so the chain is walked forward through Series-to-Series edges (by y
 * position, mirroring canvas order) to find the terminal before handing
 * off to `buildSeriesChain`, which itself walks backward from a
 * terminal to assemble the root-to-terminal array.
 *
 * `externalRefs`, forwarded verbatim to `buildSeriesChain`, opts a
 * secondary series-valued field found anywhere in this chain (append's
 * "other", ...) into promotion when its own root bridges an independent
 * DataFrame — see `buildSeriesChain`'s own docs. The caller is
 * responsible for registering every collected id as its own flat graph
 * node, exactly as `GraphDocumentBuilder.addSeriesNode` already does for
 * a top-level leaf.
 */
export function buildExprOrSeriesChain(
    nodeId: string,
    nodes: Node<AstNodeData>[],
    edges: Edge[],
    externalRefs?: Set<string>,
): any {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !isSeriesNode(node)) return buildExpr(nodeId, nodes, edges);

    let chainEndId = nodeId;
    const seen = new Set<string>();
    while (chainEndId && !seen.has(chainEndId)) {
        seen.add(chainEndId);
        const next = edges
            .filter(e => e.source === chainEndId)
            .map(e => nodes.find(n => n.id === e.target))
            .filter((n): n is Node<AstNodeData> => !!n && isSeriesNode(n))
            .sort((a, b) => a.position.y - b.position.y);
        if (next.length === 0) break;
        chainEndId = next[0].id;
    }

    const chain = buildSeriesChain(chainEndId, nodes, edges, externalRefs).filter((s: any) => s && s.type);
    return { type: "series_chain", chain };
}
