import type { Node, Edge } from "reactflow";
import type { AstNodeData } from "../types/ast_types";
import { isSeriesNode, buildSeriesChain, buildExprOrSeriesChain, findDfBridgeSourceId, seriesChainRoot, classifySeriesInputs, normalizeCombineConditionEdges } from "../utils/flow_to_ast";
import {
    incomingPortsFor,
    outgoingPortsFor,
    type Port,
} from "./node_ports";

/**
 * Single serializer, canvas -> Tsubasa AST contract.
 *
 * Replaces two independent, hand-duplicated walkers that used to
 * drift apart (`dag_builder.ts`'s old `buildGraphDocument` and
 * `flow_to_ast.ts`'s `buildDFNode`/`buildPipelineFromEnd`/
 * `flowToPipeline`): one produced the DAG contract used only by
 * "Exportar JSON", the other a linear-pipeline contract used only by
 * "Ejecutar", and neither agreed on how to resolve a join's `right`
 * input or how a grouped macro should serialize.
 *
 * `GraphDocumentBuilder` (Builder pattern: state accumulates across
 * calls to `addNode`, `build()` returns the finished document) is now
 * the only place that walks the canvas. `buildGraphDocument` (export)
 * and `buildExecutionDocument` ("Ejecutar") both resolve to it — since
 * Tsubasa's `/execute` accepts `{"graph": ...}` natively and Bulma's
 * results UI renders one tab per named output, there is no second walk
 * and no down-projection to a legacy shape for the DataFrame case.
 *
 * Wiring is resolved from `node_ports.ts`'s declarative registry
 * instead of a per-type `if/else` chain, mirroring how Tsubasa itself
 * resolves node shape from `DF_REGISTRY`/`EXPR_REGISTRY` tables rather
 * than a hand-written dispatch ladder.
 */

export interface StepJSON {
    type: string;
    input?: string;
    right?: string;
    other?: string;
    bindings?: Record<string, string>;
    [key: string]: any;
}

export interface GraphDocument {
    exprs?: Record<string, any>;
    graph: {
        nodes: Record<string, StepJSON>;
        outputs: string[];
    };
}

/**
 * Root-to-terminal ordered ids of a Series chain, walking the "main
 * chain" link backward from `terminalId`. Threads the chain through the
 * same `classifySeriesInputs` `buildSeriesChain` uses, so its output
 * array lines up index-for-index with the ids returned here — the two
 * cannot drift apart on what counts as a chain link. A free function
 * (not a `GraphDocumentBuilder` method) since `findLeafNodes` needs it
 * before any builder instance exists.
 */
function seriesChainIds(terminalId: string, nodes: Node<AstNodeData>[], edges: Edge[]): string[] {
    const ids: string[] = [];
    let currentId: string | null = terminalId;
    const seen = new Set<string>();
    while (currentId && !seen.has(currentId)) {
        seen.add(currentId);
        const node = nodes.find(n => n.id === currentId);
        if (!node || !isSeriesNode(node)) break;
        ids.unshift(currentId);
        const { mainEdge } = classifySeriesInputs(currentId, nodes, edges);
        currentId = mainEdge ? mainEdge.source : null;
    }
    return ids;
}

/**
 * True when a Series chain's root is already claimed by an enclosing DF
 * node's own declared outgoing expression port (`to_frame`'s "expr",
 * `with_columns`'s "exprs", `filter`'s "predicate", ...) — i.e. it will
 * be serialized *inline*, nested under that DF step, same as before
 * Series-typed graph outputs existed. The `df_source` bridge handle is
 * deliberately excluded: that edge means "this is the chain's real
 * DataFrame", not "this chain is embedded inside me".
 */
function isClaimedByDfBridge(rootId: string, nodes: Node<AstNodeData>[], edges: Edge[]): boolean {
    return edges.some(e => {
        if (e.target !== rootId || e.targetHandle === "df_source") return false;
        const src = nodes.find(n => n.id === e.source);
        if (!src || src.data.isExpression || isSeriesNode(src)) return false;
        const outPorts = outgoingPortsFor(src.data.nodeType);
        return src.data.nodeType === "to_frame" || outPorts.length > 0;
    });
}

export function findLeafNodes(nodes: Node<AstNodeData>[], edges: Edge[]): Node<AstNodeData>[] {
    const nodesWithDFOutgoingEdge = new Set(
        edges
            .filter(e => {
                const targetNode = nodes.find(n => n.id === e.target);
                if (!targetNode) return false;
                if (!targetNode.data.isExpression && !isSeriesNode(targetNode)) return true; // DF -> DF
                // DF -> get_column's dedicated bridge handle: this DF node
                // still feeds something real (the Series chain's data),
                // even though the target is a Series node, not a DF node.
                return isSeriesNode(targetNode) && e.targetHandle === "df_source";
            })
            .map(e => e.source)
    );

    // A node whose parentNode is a groupNode present in this same `nodes`
    // array is only ever reachable through that group's own
    // `serializeGroupAsSubgraph` walk (group membership is expressed via
    // `parentNode`, not edges, so such a node legitimately has no outgoing
    // edge of its own here). Treating it as an independent top-level leaf
    // would duplicate it — once nested inside the group's body, once again
    // as a sibling — even though only the group itself is ever referenced
    // by `outputs`.
    const groupNodeIds = new Set(nodes.filter(n => n.type === "groupNode").map(n => n.id));
    const isGroupedChild = (n: Node<AstNodeData>) => !!n.parentNode && groupNodeIds.has(n.parentNode);

    const dfLeaves = nodes.filter(n =>
        !n.data.isExpression &&
        !isSeriesNode(n) &&
        !nodesWithDFOutgoingEdge.has(n.id) &&
        !isGroupedChild(n)
    );

    // A Series node with NO outgoing edge at all — not consumed by
    // another Series node continuing the chain — is a *candidate*
    // dangling terminal. It's a genuine leaf only if its chain's root
    // also isn't already claimed inline by an enclosing DF bridge
    // (to_frame/with_columns/...); otherwise it's already being
    // serialized as that bridge's nested `chain`, and counting it again
    // here would duplicate it as a second, independent output.
    const hasAnyOutgoingEdge = new Set(edges.map(e => e.source));
    const seriesLeaves = nodes.filter(n => {
        if (!isSeriesNode(n) || hasAnyOutgoingEdge.has(n.id) || isGroupedChild(n)) return false;
        return !isClaimedByDfBridge(seriesChainIds(n.id, nodes, edges)[0], nodes, edges);
    });

    return [...dfLeaves, ...seriesLeaves];
}

export function serializeGroupAsSubgraph(groupNodeIds: Set<string>, allNodes: Node<AstNodeData>[], allEdges: Edge[]): StepJSON {
    const internalEdges = allEdges.filter(e => groupNodeIds.has(e.source) && groupNodeIds.has(e.target));
    const incomingExternal = allEdges.filter(e => groupNodeIds.has(e.target) && !groupNodeIds.has(e.source));

    const ports: Record<string, string> = {};
    const portNodes: Node<AstNodeData>[] = incomingExternal.map((e, i) => {
        const portName = `p${i}`;
        ports[portName] = e.source;
        return {
            id: `__port_${portName}`,
            type: "input_port",
            position: { x: 0, y: 0 },
            data: {
                nodeType: "input_port",
                isExpression: false,
                properties: { port: portName },
                label: `Port ${portName}`,
                stepIndex: 0
            }
        } as unknown as Node<AstNodeData>;
    });

    const rewiredEdges = internalEdges.concat(
        incomingExternal.map((e, i) => ({ ...e, source: `__port_${Object.keys(ports)[i]}` }))
    );

    const groupNodes = allNodes.filter(n => groupNodeIds.has(n.id)).concat(portNodes);
    const bodyDoc = buildGraphDocument(groupNodes, rewiredEdges);

    return {
        type: "subgraph",
        body: bodyDoc.graph,
        output: bodyDoc.graph.outputs[0],
        bindings: ports,
    };
}

// ─── Per-type base-property normalization ───────────────────────────
// The one place raw ReactFlow node properties become the literal,
// non-connector fields of a step (JSON-string properties parsed,
// per-type aliases resolved). Node-graph connectors (source/right/
// predicate/exprs/aggs/...) are layered on afterwards by the builder,
// driven by node_ports.ts — never duplicated here.

const JSON_LIST_FIELDS = ["partition_by", "columns", "subset", "mapping", "args", "on", "index"];

function parseMaybeJson(value: any): any {
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

function buildBaseStep(type: string, properties: Record<string, any>): StepJSON {
    if (type === "scan" || type === "file_reader") {
        let data = parseMaybeJson(properties.data);
        if (type === "file_reader" && (!data || Object.keys(data).length === 0)) data = {};
        return { type: "scan", data: data || {} };
    }
    if (type === "group_by") {
        return { type: "group_by", by: parseMaybeJson(properties.by) || [] };
    }
    if (type === "sort") {
        return {
            type: "sort",
            by: parseMaybeJson(properties.by) || [],
            descending: !!properties.descending,
            nulls_last: !!properties.nulls_last,
        };
    }
    if (type === "cross_join") {
        return { type: "cross_join" };
    }
    if (type === "join_asof") {
        return {
            type: "join_asof",
            on: parseMaybeJson(properties.on) || "",
            by: parseMaybeJson(properties.by) || null,
            strategy: properties.strategy || "backward",
        };
    }
    if (type === "join") {
        return {
            type: "join",
            // Tsubasa's JoinNode.on/left_on/right_on accept a single
            // column name OR a list (str | list[str] | None) — parse the
            // same way every other multi-value property already does
            // (group_by's "by", sort's "by"), which this branch had never
            // done, so a multi-column join "on" arrived as a literal
            // JSON-string and crashed with a bogus "column not found".
            on: parseMaybeJson(properties.on) || null,
            left_on: parseMaybeJson(properties.left_on) || null,
            right_on: parseMaybeJson(properties.right_on) || null,
            how: properties.how || "inner",
            suffix: properties.suffix || "_right",
        };
    }

    const step: StepJSON = { type, ...properties };
    for (const field of JSON_LIST_FIELDS) {
        if (typeof step[field] === "string" && step[field].trim().startsWith("[")) {
            step[field] = parseMaybeJson(step[field]);
        }
    }
    return step;
}

// ─── The builder ─────────────────────────────────────────────────────

export class GraphDocumentBuilder {
    private readonly nodesById: Record<string, StepJSON> = {};
    private readonly visited = new Set<string>();
    private readonly edges: Edge[];

    constructor(
        private readonly nodes: Node<AstNodeData>[],
        edges: Edge[],
    ) {
        // Canonicalise once, here, so leaf detection and every chain walk
        // below share one view of the canvas — see the function's docs.
        this.edges = normalizeCombineConditionEdges(nodes, edges);
    }

    private node(id: string): Node<AstNodeData> | undefined {
        return this.nodes.find(n => n.id === id);
    }

    private compareByOrderOrX = (side: "source" | "target") => (a: Edge, b: Edge): number => {
        const ao = a.data?.order, bo = b.data?.order;
        if (typeof ao === "number" && typeof bo === "number") return ao - bo;
        const na = this.node(a[side]);
        const nb = this.node(b[side]);
        return (na?.position.x ?? 0) - (nb?.position.x ?? 0);
    };

    /** Incoming DF ports (target = this node). All declared incoming ports today are single-arity. */
    private incoming(nodeId: string, handleId: string): Edge[] {
        return this.edges
            .filter(e => e.target === nodeId && (e.targetHandle ?? "dataflow-in") === handleId)
            .sort(this.compareByOrderOrX("source"));
    }

    /**
     * Resolves every outgoing (expression-child) port of a node at once.
     *
     * New connections carry an explicit `sourceHandle` matching the port's
     * `handleId` (rendered by AstNodeCard from the same registry) — those
     * are trusted directly. A node with *no* explicit handle on any of its
     * ports is a pre-migration flow (with_columns/group_by never exposed
     * one; `when` exposed none of its three); for those we fall back to
     * the historical behavior — pool every outgoing edge to an expression
     * node, ordered by canvas position, and assign it either to the sole
     * list-arity port or positionally across single-arity ports. This is
     * the one legacy fallback kept, isolated to a single call site instead
     * of duplicated across two files.
     */
    private resolveOutgoing(nodeId: string, ports: Port[]): Map<string, Edge[]> {
        const result = new Map<string, Edge[]>();
        let anyExplicit = false;

        for (const port of ports) {
            const explicit = this.edges.filter(e => e.source === nodeId && e.sourceHandle === port.handleId);
            if (explicit.length > 0) {
                anyExplicit = true;
                result.set(port.field, explicit.sort(this.compareByOrderOrX("target")));
            }
        }
        if (anyExplicit) {
            for (const port of ports) if (!result.has(port.field)) result.set(port.field, []);
            return result;
        }

        const pool = this.edges
            .filter(e => e.source === nodeId && !!this.node(e.target)?.data.isExpression)
            .sort(this.compareByOrderOrX("target"));

        if (ports.length === 1 && ports[0].arity === "list") {
            result.set(ports[0].field, pool);
            return result;
        }
        ports.forEach((port, i) => result.set(port.field, pool[i] ? [pool[i]] : []));
        return result;
    }

    /**
     * The real DataFrame connected to a `get_column`'s dedicated bridge
     * handle (`SERIES_EXTRA_TARGETS.get_column` in AstNodeCard.tsx),
     * distinct from the generic "expr-in" chain-continuation handle.
     * Only `get_column` ever has this edge — every other Series node's
     * `df_source`-shaped input is rejected by Tsubasa's parser.
     */
    private findDfBridgeSource(nodeId: string): string | undefined {
        return findDfBridgeSourceId(nodeId, this.nodes, this.edges);
    }

    /**
     * Serializes a dangling Series chain (found by `findLeafNodes`, no
     * downstream DF/expr consumer) as flat graph nodes threaded by
     * "input" edges — Tsubasa's parser resolves the chain's root
     * (`get_column`) bridging to a real DFNode via `df_source`, exactly
     * like a normal DF-to-DF "input" edge resolves `source`. Reuses
     * `buildSeriesChain` for each node's own JSON shape (properties +
     * secondary series-valued fields like `append.other`) so that
     * construction logic isn't duplicated — only the *linking* differs
     * (flat `input` edges here, vs. a nested `chain` array when a
     * Series chain is embedded inline under a `to_frame`/`with_columns`).
     */
    private addSeriesNode(terminalId: string): void {
        if (this.visited.has(terminalId)) return;
        const idChain = seriesChainIds(terminalId, this.nodes, this.edges);
        const externalRefs = new Set<string>();
        const stepChain = buildSeriesChain(terminalId, this.nodes, this.edges, externalRefs);

        let prevId: string | undefined;
        idChain.forEach((nid, i) => {
            if (this.visited.has(nid)) { prevId = nid; return; }
            this.visited.add(nid);
            const step: StepJSON = { ...stepChain[i] };
            if (i === 0) {
                const dfId = this.findDfBridgeSource(nid);
                if (dfId) { this.addNode(dfId); step.input = dfId; }
            } else if (prevId) {
                step.input = prevId;
            }
            this.nodesById[nid] = step;
            prevId = nid;
        });

        // A secondary series-valued field (append's "other", ...) whose
        // own chain bridges an independent DataFrame was left as a bare
        // id reference by buildSeriesChain instead of being embedded
        // inline (see its own docs) — register it as its own flat graph
        // node so that id actually resolves to something. It's a Series
        // node by construction (only get_column carries a df_source
        // bridge), so it goes through this exact same method.
        externalRefs.forEach(refId => this.addSeriesNode(refId));
    }

    /** `to_frame` is a custom builder, not a generic port table entry — mirrors Tsubasa's own `_build_to_frame`. */
    private buildToFrameStep(id: string, node: Node<AstNodeData>): StepJSON {
        const properties = node.data.properties;

        let candidates = this.edges
            .filter(e => e.source === id)
            .map(e => this.node(e.target))
            .filter((n): n is Node<AstNodeData> => !!n && n.data.isExpression)
            .sort((a, b) => a.position.x - b.position.x);

        if (candidates.length === 0) {
            candidates = this.edges
                .filter(e => e.target === id)
                .map(e => this.node(e.source))
                .filter((n): n is Node<AstNodeData> => !!n && isSeriesNode(n));
        }

        let expr: any = null;
        const externalRefs = new Set<string>();
        if (candidates.length > 0) {
            expr = buildExprOrSeriesChain(candidates[0].id, this.nodes, this.edges, externalRefs);
        }
        externalRefs.forEach(refId => this.addSeriesNode(refId));

        const step: StepJSON = { type: "to_frame", name: properties.name || "", expr };

        const incomingDF = this.edges.find(e => {
            if (e.target !== id) return false;
            const src = this.node(e.source);
            return !!src && !src.data.isExpression;
        });
        if (incomingDF) {
            this.addNode(incomingDF.source);
            step.input = incomingDF.source; // wire key is "input" — see node_ports.ts
        } else if (candidates.length > 0) {
            // No direct DF edge into to_frame itself — check whether the
            // chain's root (get_column) has its own DF bridge instead
            // (the user connected Scan straight into get_column, or wired
            // the chain's own terminal "out" into to_frame's "in" — either
            // way, `candidates[0]` can land anywhere along the chain, not
            // necessarily its root, so it must be walked back to the root
            // first). Without this fallback, to_frame would silently fall
            // back to Tsubasa's terminal_series/synthetic-stub path (no
            // df_source is ever reachable from a nested, non-flat chain)
            // and read no real data.
            const rootId = seriesChainRoot(candidates[0].id, this.nodes, this.edges);
            const dfId = this.findDfBridgeSource(rootId);
            if (dfId) {
                this.addNode(dfId);
                step.input = dfId;
            }
        }
        return step;
    }

    private addNode(id: string): void {
        if (this.visited.has(id)) return;
        this.visited.add(id);
        const node = this.node(id);
        if (!node) return;

        if (node.type === "groupNode") {
            const childrenIds = new Set(this.nodes.filter(n => n.parentNode === id).map(n => n.id));
            this.nodesById[id] = serializeGroupAsSubgraph(childrenIds, this.nodes, this.edges);
            const incomingExternal = this.edges.filter(e => childrenIds.has(e.target) && !childrenIds.has(e.source));
            incomingExternal.forEach(e => this.addNode(e.source));
            return;
        }

        const type = node.data.nodeType;

        if (type === "to_frame") {
            this.nodesById[id] = this.buildToFrameStep(id, node);
            return;
        }

        const step = buildBaseStep(type, node.data.properties);

        // Join/join_asof/cross_join/vstack/hstack's two DF inputs are just
        // another declared multi-port shape (node_ports.ts) — resolved
        // through the exact same id-based edge lookup as every other node's
        // incoming ports. No type-specific branch, no label/position
        // fallback: an edge counts only if it targets the right handle.
        for (const port of incomingPortsFor(type)) {
            const edges = this.incoming(id, port.handleId);
            if (port.arity === "single") {
                const e = edges[0];
                if (e) { this.addNode(e.source); step[port.field] = e.source; }
            } else {
                edges.forEach(e => this.addNode(e.source));
                step[port.field] = edges.map(e => e.source);
            }
        }

        const outPorts = outgoingPortsFor(type);
        if (outPorts.length > 0) {
            const resolved = this.resolveOutgoing(id, outPorts);
            const outgoingExternalRefs = new Set<string>();
            for (const port of outPorts) {
                const edges = resolved.get(port.field) ?? [];
                const built = edges.map(e => buildExprOrSeriesChain(e.target, this.nodes, this.edges, outgoingExternalRefs));
                step[port.field] = port.arity === "list" ? built : (built[0] ?? null);
            }
            outgoingExternalRefs.forEach(refId => this.addSeriesNode(refId));
        }

        this.nodesById[id] = step;
    }

    build(): GraphDocument {
        const leaves = findLeafNodes(this.nodes, this.edges);
        leaves.forEach(l => isSeriesNode(l) ? this.addSeriesNode(l.id) : this.addNode(l.id));

        const groupIdsInContext = new Set(this.nodes.filter(n => n.type === "groupNode").map(n => n.id));
        const outputs = Array.from(new Set(leaves.map(l =>
            l.parentNode && groupIdsInContext.has(l.parentNode) ? l.parentNode : l.id
        )));

        return { graph: { nodes: this.nodesById, outputs } };
    }
}

export function buildGraphDocument(nodes: Node<AstNodeData>[], edges: Edge[]): GraphDocument {
    return new GraphDocumentBuilder(nodes, edges).build();
}

/**
 * Single entry point for "Ejecutar": builds the canvas through the same
 * `GraphDocumentBuilder` used by "Exportar JSON" — no second walk of
 * `nodes`/`edges` happens anywhere in this path. Since Tsubasa's graph
 * parser now accepts a Series-typed node/output directly (a `get_column`
 * chain bridging to a real DFNode via `df_source`, or a self-contained
 * chain rooted in `from_list`/`from_scalar`), a canvas with no DataFrame
 * nodes at all no longer needs the separate `{"series": [...]}` document
 * shape this used to special-case — `buildGraphDocument` handles it the
 * same way it handles everything else, through `findLeafNodes` +
 * `GraphDocumentBuilder.addSeriesNode`.
 */
export function buildExecutionDocument(nodes: Node<AstNodeData>[], edges: Edge[]): GraphDocument {
    return buildGraphDocument(nodes, edges);
}
