import type { Node, Edge } from "reactflow";
import type { PipelineJson, AstNodeData } from "../types/ast_types";
import type { GraphDocument, StepJSON } from "../algoritmos/dag_builder";
import { incomingPortsFor } from "../algoritmos/node_ports";
import { SERIES_NODE_TYPES, DF_EXPR_ONLY_TYPES } from "../algoritmos/series_types";
import { getNodeLabel } from "./node_labels";

/**
 * Converts a pipeline JSON into ReactFlow nodes and edges.
 * Produces a top-down tree layout with automatic positioning.
 */

// Every expression node type: DataFrame AST expressions (col/lit/binary/...)
// plus every Series AST node type. See series_types.ts for the canonical
// breakdown — kept as one set here since most of this file only cares
// whether a step is "an expression" at all, not which kind.
const EXPR_TYPES = new Set([...DF_EXPR_ONLY_TYPES, ...SERIES_NODE_TYPES]);

// Series node type -> its one secondary series-valued field's JSON key,
// which doubles as the target handle id (SERIES_EXTRA_TARGETS in
// AstNodeCard.tsx). Mirrors Tsubasa's SERIES_SECONDARY_EDGE_KEYS
// (parser.py) — kept in sync by hand since the two live in separate
// repos with no shared contract file (see ast_contract.json proposal).
const SERIES_SECONDARY_FIELDS: Record<string, string> = {
    append: "other",
    is_in: "values_series",
    contains_any: "patterns_series",
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 72;
const H_GAP = 40;
const V_GAP = 100;

let nodeCounter = 0;

// Ids `graphDocumentToFlow` must not hand out to a freshly-minted embedded
// child, because they're already taken by a preserved flat top-level node
// id from the same document (see graphDocumentToFlow below). Both use the
// exact same "ast_N" counter scheme, so resetting nodeCounter to 0 on
// reload is guaranteed to eventually collide with a preserved id from an
// earlier session — two different nodes ending up with the same React
// Flow id, silently breaking whichever one loses the collision along with
// every edge that referenced it.
let reservedIds: Set<string> | null = null;

// Flat top-level node ids of the GraphDocument currently being
// reconstructed (graphDocumentToFlow), consulted by processExpr's
// other/values_series/patterns_series handling below: since Fase 6
// (Tsubasa's nested id-reference resolution), one of those fields can
// hold a bare id string that points at a flat node instead of an
// embedded dict — e.g. an `append` nested inside `to_frame`'s own
// `expr`, whose "other" bridges an independent DataFrame and had to be
// promoted to its own flat node for that DataFrame reference to be
// expressible at all. `null` outside graph-document reconstruction
// (the legacy pipeline/series-chain formats never produce this shape).
let flatNodeIds: Set<string> | null = null;

function nextId(): string {
    let id: string;
    do {
        id = `ast_${nodeCounter++}`;
    } while (reservedIds?.has(id));
    return id;
}


function extractProperties(step: any): Record<string, any> {
    const props: Record<string, any> = {};
    // In a GraphDocument, "input" is always a pure wire connector (a
    // sibling node id) for both DF and Series steps — never a literal
    // property. "right"/"other"/"bindings"/"body"/"output" are the same,
    // but only for DF-registry steps: a Series step's "other" can, in a
    // legacy/malformed fallback, hold a literal (non-embedded) value, so
    // it's only hidden below when it's actually object-shaped.
    const isDfStep = !EXPR_TYPES.has(step.type);
    for (const [k, v] of Object.entries(step)) {
        if (k === "type" || k === "input") continue;
        if (isDfStep && (k === "right" || k === "other" || k === "bindings" || k === "body" || k === "output")) continue;
        // A Series step's secondary series-valued fields (append's
        // "other", is_in's "values_series", contains_any's
        // "patterns_series") hold a bare node-id string when that
        // operand bridges its own DataFrame and was promoted to a flat
        // graph node instead of embedded inline (see
        // SERIES_SECONDARY_FIELDS below) — a pure wire connector, same
        // as "input", never a literal property.
        if (!isDfStep && typeof v === "string" && SERIES_SECONDARY_FIELDS[step.type] === k) continue;
        // Skip nested objects that become child nodes
        if (typeof v === "object" && v !== null && !Array.isArray(v) && "type" in v) continue;
        if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && "type" in v[0]) continue;
        // Skip pipeline-wrapped nested objects
        if (typeof v === "object" && v !== null && "pipeline" in v) continue;
        props[k] = v;
    }
    return props;
}

interface LayoutResult {
    nodes: Node<AstNodeData>[];
    edges: Edge[];
    width: number;
}

/**
 * Expands an embedded expression-shaped value into a child subtree.
 * A plain nested step dict recurses through `processExpr` as before; a
 * `{"type": "series_chain", "chain": [...]}` wrapper (the shape
 * `to_frame`/`with_columns`/`filter`/... embed a Series chain in —
 * Tsubasa's `parse_expr` accepts it anywhere an `ExprNode` is expected,
 * see `parser.py`) is expanded as a real connected chain instead of a
 * single opaque, unrecognized node — this codebase's only previous
 * handling of an embedded chain was `extract_series_chain` as a
 * top-level *pipeline step*, never as a nested expression value.
 */
function expandEmbedded(value: any, x: number, y: number, parentId?: string): LayoutResult | null {
    if (!value || typeof value !== "object" || !("type" in value)) return null;
    if (value.type === "series_chain") {
        return processSeriesChainArray(value.chain ?? [], x, y, parentId);
    }
    return processExpr(value, x, y, parentId);
}

/** Sequential (not tree-nested) reconstruction of a Series chain array —
 * shared by `extract_series_chain`'s embedded form (via `expandEmbedded`)
 * and the flat graph-node form (`graphDocumentToFlow`'s `addSeriesNode`
 * mirror). `parentId`'s edge lands on the chain's *root* (first element),
 * matching how the canvas always draws a chain's incoming edge onto its
 * root, never its terminal. */
function processSeriesChainArray(chain: any[], x: number, y: number, parentId?: string): LayoutResult {
    const nodes: Node<AstNodeData>[] = [];
    const edges: Edge[] = [];
    let prevId: string | null = null;
    let rootId: string | null = null;
    let curY = y;

    for (const step of chain) {
        const result = processExpr(step, x, curY);
        nodes.push(...result.nodes);
        edges.push(...result.edges);
        const thisId = result.nodes[0]?.id;
        if (prevId && thisId) {
            edges.push({
                id: `series_${prevId}_${thisId}`,
                source: prevId,
                target: thisId,
                animated: true,
                style: { stroke: "#AC59B4", strokeWidth: 3 },
                type: "smoothstep",
                markerEnd: { type: "arrowclosed" as any, color: "#AC59B4" },
            });
        }
        if (!rootId) rootId = thisId ?? null;
        prevId = thisId ?? prevId;
        const maxY = Math.max(...result.nodes.map(n => n.position.y));
        curY = maxY + V_GAP + 20;
    }

    if (parentId && rootId) {
        edges.push({
            id: `e_${parentId}_${rootId}`,
            source: parentId,
            target: rootId,
            animated: true,
            style: { stroke: "#8a8a8a", strokeWidth: 2 },
            type: "smoothstep",
        });
    }

    return { nodes, edges, width: NODE_WIDTH };
}

function processExpr(
    expr: any,
    x: number,
    y: number,
    parentId?: string,
    forcedId?: string,
): LayoutResult {
    const nodes: Node<AstNodeData>[] = [];
    const edges: Edge[] = [];

    const id = forcedId ?? nextId();
    const nodeType = expr.type || "unknown";
    const isExpr = EXPR_TYPES.has(nodeType);

    nodes.push({
        id,
        type: "astNode",
        position: { x, y },
        data: {
            nodeType,
            label: getNodeLabel(nodeType, expr),
            properties: extractProperties(expr),
            stepIndex: -1,
            isExpression: isExpr,
        },
    });

    if (parentId) {
        edges.push({
            id: `e_${parentId}_${id}`,
            source: parentId,
            target: id,
            animated: true,
            style: { stroke: "#8a8a8a", strokeWidth: 2 },
            type: "smoothstep",
        });
    }

    // Process child expressions
    const childResults: LayoutResult[] = [];
    const childY = y + V_GAP;
    const addChild = (value: any) => {
        const r = expandEmbedded(value, 0, childY, id);
        if (r) childResults.push(r);
    };

    // Binary: left + right
    addChild(expr.left);
    if (expr.right && typeof expr.right === "object" && "type" in expr.right && !("pipeline" in expr.right)) {
        addChild(expr.right);
    }

    // on (for Call)
    addChild(expr.on);

    // expr (for Alias, Cast, Over, SortExpr, to_frame)
    addChild(expr.expr);

    // operand (for Unary — node_ports.ts declares its outgoing field as
    // "operand", not "expr"; flow_to_ast.ts's buildExpr serializes it
    // that way, so the reload side must read the same key.)
    addChild(expr.operand);

    // When: condition, then, otherwise
    addChild(expr.condition);
    addChild(expr.then);
    addChild(expr.otherwise);

    // Exprs list (select, with_columns, group_by aggs)
    const exprsList = expr.exprs || expr.aggs;
    if (Array.isArray(exprsList)) {
        for (const e of exprsList) addChild(e);
    }

    // Predicate (filter)
    addChild(expr.predicate);

    // Series-only secondary embedded fields (append's "other", is_in's
    // "values_series", contains_any's "patterns_series"): on the live
    // canvas these are an *incoming* edge onto this node's own extra
    // target handle (SERIES_EXTRA_TARGETS in AstNodeCard.tsx), not an
    // outgoing expression port — so, unlike every field above, the edge
    // runs content -> this node, reversed from the parent -> child
    // direction `addChild` draws.
    for (const field of ["other", "values_series", "patterns_series"] as const) {
        const value = expr[field];
        // A bare id string referencing an already-registered flat node
        // (Fase 6's nested-reference promotion) — draw the edge directly;
        // the referenced node's own subtree is built separately, by
        // graphDocumentToFlow's own top-level pass over flatNodes.
        if (typeof value === "string" && flatNodeIds?.has(value)) {
            edges.push({
                id: `${field}_${value}_${id}`,
                source: value,
                target: id,
                targetHandle: field,
                animated: true,
                style: { stroke: "#AC59B4", strokeWidth: 3 },
                type: "smoothstep",
            });
            continue;
        }
        const r = expandEmbedded(value, 0, childY, undefined);
        if (!r) continue;
        const contentRootId = r.nodes[0]?.id;
        if (contentRootId) {
            r.edges.push({
                id: `${field}_${contentRootId}_${id}`,
                source: contentRootId,
                target: id,
                targetHandle: field,
                animated: true,
                style: { stroke: "#AC59B4", strokeWidth: 3 },
                type: "smoothstep",
            });
        }
        childResults.push(r);
    }

    // Layout children horizontally
    let totalChildWidth = 0;
    for (const r of childResults) {
        totalChildWidth += r.width;
    }
    totalChildWidth += Math.max(0, childResults.length - 1) * H_GAP;

    let childX = x - totalChildWidth / 2;
    for (const r of childResults) {
        const offsetX = childX + r.width / 2 - NODE_WIDTH / 2;
        for (const n of r.nodes) {
            n.position.x += offsetX;
        }
        nodes.push(...r.nodes);
        edges.push(...r.edges);
        childX += r.width + H_GAP;
    }

    const myWidth = Math.max(NODE_WIDTH, totalChildWidth);

    return { nodes, edges, width: myWidth };
}

function isSeriesStepType(type: string): boolean {
    return SERIES_NODE_TYPES.has(type);
}

/**
 * Flattens a `subgraph` step's body into the enclosing flat node map,
 * rewriting its internal `input_port` placeholders (see
 * `serializeGroupAsSubgraph` in dag_builder.ts) to whatever outer node
 * they're bound to. Ids are prefixed by the subgraph's own id to avoid
 * collisions with sibling scopes; nested subgraphs recurse.
 *
 * This loses the visual "group box" the canvas rendered before export
 * (there is no bindings-aware inverse for groupNode positioning) but
 * loses no data — every real step the subgraph contained is loaded,
 * connected, and executable, just ungrouped.
 */
function flattenSubgraphInto(
    outerId: string,
    step: StepJSON,
    into: Record<string, StepJSON>,
): string {
    const prefix = `${outerId}__`;
    const body = step.body as { nodes: Record<string, StepJSON>; outputs: string[] } | undefined;
    const bindings: Record<string, string> = step.bindings ?? {};
    if (!body || !body.nodes) return outerId;

    const portRemap = new Map<string, string>();
    for (const [innerId, innerStep] of Object.entries(body.nodes)) {
        if (innerStep.type === "input_port") {
            const portName = (innerStep as any).port ?? innerStep.properties?.port;
            const outerRef = portName !== undefined ? bindings[portName] : undefined;
            if (outerRef) portRemap.set(innerId, outerRef);
        }
    }
    const remapId = (ref: unknown): string | undefined => {
        if (typeof ref !== "string") return undefined;
        return portRemap.get(ref) ?? prefix + ref;
    };

    let bodyOutputId = body.outputs[0];
    for (const [innerId, innerStep] of Object.entries(body.nodes)) {
        if (innerStep.type === "input_port") continue;
        if (innerStep.type === "subgraph") {
            const resolvedId = flattenSubgraphInto(prefix + innerId, innerStep, into);
            if (innerId === bodyOutputId) bodyOutputId = resolvedId;
            continue;
        }
        const rewritten: StepJSON = { ...innerStep };
        for (const key of ["input", "right", "other"] as const) {
            if (typeof rewritten[key] === "string") {
                const remapped = remapId(rewritten[key]);
                if (remapped !== undefined) rewritten[key] = remapped;
            }
        }
        into[prefix + innerId] = rewritten;
    }
    return portRemap.get(bodyOutputId) ?? prefix + bodyOutputId;
}

/**
 * Converts a modern `GraphDocument` (`{"graph": {"nodes": {...},
 * "outputs": [...]}}` — what `buildGraphDocument`/"Exportar JSON" and
 * "Ejecutar" both produce, see dag_builder.ts) into ReactFlow
 * nodes/edges. The inverse of `GraphDocumentBuilder`: real node ids are
 * preserved (not regenerated), and every "input"/"right"/"other"
 * id-reference becomes an edge on the same handle `node_ports.ts`
 * declares for that step's type, so the write and read sides share one
 * contract instead of diverging (this function not existing at all —
 * `pipelineToFlow` had no case for `"graph"` in the document — is why
 * reloading an exported pipeline produced a blank canvas).
 */
export function graphDocumentToFlow(doc: GraphDocument): { nodes: Node<AstNodeData>[]; edges: Edge[] } {
    nodeCounter = 0;

    // subgraph steps are flattened into the same flat id -> step map
    // everything else lives in, before any ReactFlow node is built.
    const flatNodes: Record<string, StepJSON> = {};
    for (const [id, step] of Object.entries(doc.graph.nodes)) {
        if (step.type === "subgraph") {
            flattenSubgraphInto(id, step, flatNodes);
        } else {
            flatNodes[id] = step;
        }
    }

    const allNodes: Node<AstNodeData>[] = [];
    const allEdges: Edge[] = [];

    // Both consult the exact same set of ids — reservedIds so a freshly
    // minted embedded-child id never collides with one (see nextId
    // above), flatNodeIds so a bare id string found in other/
    // values_series/patterns_series is recognized as a reference to one
    // of them rather than mishandled as a literal/embedded value.
    reservedIds = new Set(Object.keys(flatNodes));
    flatNodeIds = reservedIds;
    try {
        // Pass 1: one flow node per flat graph node id (id preserved), plus
        // any embedded expression content (exprs/predicate/aggs/expr/
        // series_chain/...) via the exact same `processExpr` recursion the
        // linear-pipeline format already uses — that nested JSON shape
        // doesn't change between formats.
        for (const [id, step] of Object.entries(flatNodes)) {
            const result = processExpr(step, 0, 0, undefined, id);
            allNodes.push(...result.nodes);
            allEdges.push(...result.edges);
        }
    } finally {
        reservedIds = null;
        flatNodeIds = null;
    }

    // Pass 2: connector edges between flat nodes, resolved purely by id
    // — never by label or canvas position.
    for (const [id, step] of Object.entries(flatNodes)) {
        if (isSeriesStepType(step.type)) {
            const refId = step.input;
            if (typeof refId === "string" && refId in flatNodes) {
                const refIsSeries = isSeriesStepType(flatNodes[refId].type);
                allEdges.push({
                    id: `graph_${refId}_${id}_input`,
                    source: refId,
                    target: id,
                    sourceHandle: "dataflow-out",
                    targetHandle: refIsSeries ? "expr-in" : "df_source",
                    animated: true,
                    style: { stroke: "#AC59B4", strokeWidth: 3 },
                    type: "smoothstep",
                    markerEnd: { type: "arrowclosed" as any, color: "#AC59B4" },
                });
            }
            // Secondary field (append's "other", ...) promoted to a flat
            // node instead of embedded inline — same content -> host
            // direction the embedded/inline form draws in processExpr,
            // just resolved by id instead of by recursing into a nested
            // dict. See SERIES_SECONDARY_FIELDS and buildSeriesChain's
            // externalRefs (flow_to_ast.ts).
            const secondaryField = SERIES_SECONDARY_FIELDS[step.type];
            const secondaryRef = secondaryField ? step[secondaryField] : undefined;
            if (secondaryField && typeof secondaryRef === "string" && secondaryRef in flatNodes) {
                allEdges.push({
                    id: `graph_${secondaryRef}_${id}_${secondaryField}`,
                    source: secondaryRef,
                    target: id,
                    sourceHandle: "dataflow-out",
                    targetHandle: secondaryField,
                    animated: true,
                    style: { stroke: "#AC59B4", strokeWidth: 3 },
                    type: "smoothstep",
                    markerEnd: { type: "arrowclosed" as any, color: "#AC59B4" },
                });
            }
            continue;
        }
        for (const port of incomingPortsFor(step.type)) {
            const refId = step[port.field];
            if (typeof refId === "string" && refId in flatNodes) {
                allEdges.push({
                    id: `graph_${refId}_${id}_${port.field}`,
                    source: refId,
                    target: id,
                    sourceHandle: "dataflow-out",
                    targetHandle: port.handleId,
                    animated: true,
                    style: { stroke: "#229AA4", strokeWidth: 3 },
                    type: "smoothstep",
                    markerEnd: { type: "arrowclosed" as any, color: "#229AA4" },
                });
            }
        }
    }

    layoutGraphNodes(allNodes, allEdges);
    return { nodes: allNodes, edges: allEdges };
}

/**
 * Simple layered layout for the flat graph nodes: y by BFS depth from
 * root nodes (no incoming connector edge), x by order within its depth
 * level. Nodes created by `processExpr`'s own embedded-content
 * recursion already carry sensible relative positions from that
 * function and are left untouched — only the flat top-level graph
 * nodes (identified by having no incoming "e_"/"series_"/field-named
 * embedding edge, i.e. not already positioned as someone's embedded
 * child) are repositioned here.
 */
function layoutGraphNodes(nodes: Node<AstNodeData>[], edges: Edge[]): void {
    const embeddedEdges = edges.filter(e => !e.id.startsWith("graph_"));
    const embeddedChildIds = new Set(embeddedEdges.map(e => e.target));
    const topLevel = nodes.filter(n => !embeddedChildIds.has(n.id));
    const topLevelIds = new Set(topLevel.map(n => n.id));

    const connectorEdges = edges.filter(e => e.id.startsWith("graph_") && topLevelIds.has(e.source) && topLevelIds.has(e.target));
    const byTarget = new Map<string, string[]>();
    const incomingCount = new Map<string, number>();
    topLevel.forEach(n => incomingCount.set(n.id, 0));
    connectorEdges.forEach(e => {
        incomingCount.set(e.target, (incomingCount.get(e.target) ?? 0) + 1);
        if (!byTarget.has(e.source)) byTarget.set(e.source, []);
        byTarget.get(e.source)!.push(e.target);
    });

    const depth = new Map<string, number>();
    const queue = topLevel.filter(n => (incomingCount.get(n.id) ?? 0) === 0).map(n => n.id);
    const visited = new Set(queue);
    queue.forEach(id => depth.set(id, 0));
    let head = 0;
    while (head < queue.length) {
        const cur = queue[head++];
        const d = depth.get(cur) ?? 0;
        for (const next of byTarget.get(cur) ?? []) {
            if (!visited.has(next)) {
                visited.add(next);
                depth.set(next, d + 1);
                queue.push(next);
            } else if ((depth.get(next) ?? 0) < d + 1) {
                depth.set(next, d + 1);
            }
        }
    }
    topLevel.forEach(n => { if (!depth.has(n.id)) depth.set(n.id, 0); });

    const originalPos = new Map(nodes.map(n => [n.id, { x: n.position.x, y: n.position.y }]));

    const perDepthCount = new Map<number, number>();
    topLevel.forEach(n => {
        const d = depth.get(n.id)!;
        const i = perDepthCount.get(d) ?? 0;
        perDepthCount.set(d, i + 1);
        n.position = { x: 400 + i * (NODE_WIDTH + H_GAP + 40), y: 50 + d * (V_GAP + NODE_HEIGHT) };
    });

    // `processExpr`'s embedded-content recursion lays out each top-level
    // node's subtree relative to that node's *pre-layout* position (0, 0)
    // — see graphDocumentToFlow's Pass 1. Moving the top-level node here
    // without carrying its embedded descendants along the same delta
    // leaves them stranded near the old origin, decoupled from the parent
    // they render as children of (a `select`'s columns, a `filter`'s
    // predicate, ...): the canvas looks scattered/disconnected on reload
    // even though the edges themselves are wired correctly.
    const embeddedAdjacency = new Map<string, string[]>();
    for (const e of embeddedEdges) {
        (embeddedAdjacency.get(e.source) ?? embeddedAdjacency.set(e.source, []).get(e.source)!).push(e.target);
        (embeddedAdjacency.get(e.target) ?? embeddedAdjacency.set(e.target, []).get(e.target)!).push(e.source);
    }
    const nodesById = new Map(nodes.map(n => [n.id, n]));

    topLevel.forEach(root => {
        const orig = originalPos.get(root.id)!;
        const dx = root.position.x - orig.x;
        const dy = root.position.y - orig.y;
        if (dx === 0 && dy === 0) return;

        const seen = new Set([root.id]);
        const stack = [...(embeddedAdjacency.get(root.id) ?? [])];
        while (stack.length > 0) {
            const id = stack.pop()!;
            if (seen.has(id) || topLevelIds.has(id)) continue;
            seen.add(id);
            const node = nodesById.get(id);
            if (node) {
                node.position = { x: node.position.x + dx, y: node.position.y + dy };
            }
            for (const next of embeddedAdjacency.get(id) ?? []) stack.push(next);
        }
    });
}

export function pipelineToFlow(pipeline: PipelineJson | { series: any[] } | GraphDocument): { nodes: Node<AstNodeData>[]; edges: Edge[] } {
    // Modern flat GraphDocument — what "Exportar JSON"/"Ejecutar" emit today.
    if ("graph" in pipeline) {
        return graphDocumentToFlow(pipeline);
    }

    // Handle Series chain format
    if ("series" in pipeline) {
        return seriesChainToFlow(pipeline.series);
    }

    nodeCounter = 0;
    const allNodes: Node<AstNodeData>[] = [];
    const allEdges: Edge[] = [];

    const steps = pipeline.pipeline || [];
    let prevStepId: string | null = null;
    let currentY = 50;

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        if (step.type === "extract_series_chain") {
            const chain = step.chain || [];
            let prevChainNodeId = prevStepId;
            let chainY = currentY;
            for (let j = 0; j < chain.length; j++) {
                const chainStep = chain[j];
                const parentNode = allNodes.find(n => n.id === prevStepId);
                const chainX = parentNode ? parentNode.position.x : 400;

                const result = processExpr(chainStep, chainX, chainY);
                allNodes.push(...result.nodes);
                allEdges.push(...result.edges);

                const rootId = result.nodes[0]?.id;
                if (prevChainNodeId && rootId) {
                    // j === 0 bridges back to the DF pipeline state this
                    // chain was extracted from — the same "df_source"
                    // bridge get_column's live canvas handle uses (see
                    // SERIES_EXTRA_TARGETS.get_column in AstNodeCard.tsx
                    // and findDfBridgeSource in dag_builder.ts). Without
                    // this handle, dag_builder.ts's isClaimedByDfBridge
                    // misreads the edge as "this chain is embedded inside
                    // prevChainNodeId's own expr output" and silently
                    // drops the whole chain on re-export.
                    const isDfBridge = j === 0 && chainStep.type === "get_column";
                    allEdges.push({
                        id: `series_${prevChainNodeId}_${rootId}`,
                        source: prevChainNodeId,
                        target: rootId,
                        targetHandle: isDfBridge ? "df_source" : undefined,
                        animated: true,
                        style: { stroke: "#AC59B4", strokeWidth: 3 },
                        type: "smoothstep",
                        markerEnd: { type: "arrowclosed" as any, color: "#AC59B4" },
                    });
                }
                prevChainNodeId = rootId;
                const maxY = Math.max(...result.nodes.map(n => n.position.y));
                chainY = maxY + V_GAP + 20;
            }
            currentY = chainY;
            continue;
        }

        const result = processExpr(step, 400, currentY);

        // Set step index on the root node of this step
        if (result.nodes.length > 0) {
            result.nodes[0].data.stepIndex = i;
        }

        allNodes.push(...result.nodes);
        allEdges.push(...result.edges);

        // Connect to previous step (pipeline flow)
        const rootId = result.nodes[0]?.id;
        if (prevStepId && rootId) {
            allEdges.push({
                id: `pipe_${prevStepId}_${rootId}`,
                source: prevStepId,
                target: rootId,
                animated: true,
                style: { stroke: "#229AA4", strokeWidth: 3 },
                type: "smoothstep",
                markerEnd: { type: "arrowclosed" as any, color: "#229AA4" },
            });
        }

        prevStepId = rootId;

        // Calculate next Y based on max depth of this sub-tree
        const maxY = Math.max(...result.nodes.map(n => n.position.y));
        currentY = maxY + V_GAP + 20;
    }

    // Handle "right" pipeline for joins
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (step.right && typeof step.right === "object" && "pipeline" in step.right) {
            const rightPipeline = step.right as PipelineJson;
            const rightSteps = rightPipeline.pipeline || [];
            const parentNode = allNodes.find(n => n.data.stepIndex === i);
            if (parentNode && rightSteps.length > 0) {
                const rightX = parentNode.position.x + 350;
                let rightY = parentNode.position.y;
                let prevRightId: string | null = null;

                for (const rs of rightSteps) {
                    const rResult = processExpr(rs, rightX, rightY);
                    allNodes.push(...rResult.nodes);
                    allEdges.push(...rResult.edges);

                    const rRootId = rResult.nodes[0]?.id;
                    if (prevRightId && rRootId) {
                        allEdges.push({
                            id: `rpipe_${prevRightId}_${rRootId}`,
                            source: prevRightId,
                            target: rRootId,
                            animated: true,
                            style: { stroke: "#229AA4", strokeWidth: 3 },
                            type: "smoothstep",
                        });
                    }
                    prevRightId = rRootId;
                    const maxYr = Math.max(...rResult.nodes.map(n => n.position.y));
                    rightY = maxYr + V_GAP;
                }

                // Connect right pipeline to join node
                if (prevRightId && parentNode.id) {
                    allEdges.push({
                        id: `join_right_${prevRightId}_${parentNode.id}`,
                        source: prevRightId,
                        target: parentNode.id,
                        animated: true,
                        style: { stroke: "#229AA4", strokeWidth: 2, strokeDasharray: "5,5" },
                        type: "smoothstep",
                        label: "right",
                    });
                }
            }
        }
    }

    return { nodes: allNodes, edges: allEdges };
}

/**
 * Converts a Series chain JSON into ReactFlow nodes and edges.
 * Series chains are linear sequences of Series operations.
 */
export function seriesChainToFlow(seriesChain: any[]): { nodes: Node<AstNodeData>[]; edges: Edge[] } {
    nodeCounter = 0;
    const allNodes: Node<AstNodeData>[] = [];
    const allEdges: Edge[] = [];

    let prevNodeId: string | null = null;
    let currentY = 50;

    for (let i = 0; i < seriesChain.length; i++) {
        const step = seriesChain[i];
        const result = processExpr(step, 400, currentY);

        allNodes.push(...result.nodes);
        allEdges.push(...result.edges);

        // Connect to previous node (series chain flow)
        const rootId = result.nodes[0]?.id;
        if (prevNodeId && rootId) {
            allEdges.push({
                id: `series_${prevNodeId}_${rootId}`,
                source: prevNodeId,
                target: rootId,
                animated: true,
                style: { stroke: "#AC59B4", strokeWidth: 3 },
                type: "smoothstep",
                markerEnd: { type: "arrowclosed" as any, color: "#AC59B4" },
            });
        }

        prevNodeId = rootId;
        currentY += V_GAP + 20;
    }

    return { nodes: allNodes, edges: allEdges };
}
