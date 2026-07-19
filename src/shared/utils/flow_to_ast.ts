import type { Node, Edge } from "reactflow";
import type { AstNodeData } from "../types/ast_types";
import { buildBinaryOpChain, type ChainOp } from "./ast_wrappers";
import { SERIES_NODE_TYPES } from "../algoritmos/series_types";

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

/** Walks a Series chain's "main chain" link (the same one `buildSeriesChain`
 * threads) backward from `nodeId` to find its root. */
export function seriesChainRoot(nodeId: string, nodes: Node<AstNodeData>[], edges: Edge[]): string {
    let currentId = nodeId;
    const seen = new Set<string>();
    while (!seen.has(currentId)) {
        seen.add(currentId);
        const mainEdge = edges.find(e => {
            if (e.target !== currentId) return false;
            const src = nodes.find(n => n.id === e.source);
            return !!src && isSeriesNode(src) && (!e.targetHandle || e.targetHandle === "expr-in" || e.targetHandle === "dataflow-in");
        });
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

        // Find incoming edges from other Series nodes
        const incomingEdges = edges.filter(e => e.target === currentNodeId);

        // Check for property edges (e.g. values_series, patterns_series)
        // These are incoming edges where the targetHandle is NOT expr-in
        for (const edge of incomingEdges) {
            if (edge.targetHandle && edge.targetHandle !== "expr-in" && edge.targetHandle !== "dataflow-in") {
                const srcNode = nodes.find(n => n.id === edge.source);
                if (srcNode && isSeriesNode(srcNode)) {
                    if (externalRefs) {
                        const rootId = seriesChainRoot(edge.source, nodes, edges);
                        if (findDfBridgeSourceId(rootId, nodes, edges) !== undefined) {
                            stepJson[edge.targetHandle] = edge.source;
                            externalRefs.add(edge.source);
                            continue;
                        }
                    }
                    // It's a property chain, parse it and assign to the corresponding property
                    const subchain = buildSeriesChain(edge.source, nodes, edges, externalRefs);
                    if (subchain.length > 0) {
                        stepJson[edge.targetHandle] = subchain.length === 1 ? subchain[0] : {
                            type: "extract_series_chain",
                            chain: subchain
                        };
                    }
                }
            }
        }

        // Find the previous node in the MAIN chain
        const seriesIncomingEdge = incomingEdges.find(e => {
            const srcNode = nodes.find(n => n.id === e.source);
            return srcNode && isSeriesNode(srcNode) && (!e.targetHandle || e.targetHandle === "expr-in" || e.targetHandle === "dataflow-in");
        });

        currentNodeId = seriesIncomingEdge ? seriesIncomingEdge.source : null;
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
