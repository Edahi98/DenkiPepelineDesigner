/**
 * Declarative registry of AST connectors ("ports") per node type.
 *
 * This is the single source of truth for two previously-independent
 * concerns that used to drift apart:
 *   1. Which <Handle> elements AstNodeCard renders for a node type.
 *   2. Which edge fills which backend field when GraphDocumentBuilder
 *      serializes the canvas.
 *
 * Adding or fixing a node's wiring means editing exactly one entry
 * here — never a `case` in a renderer switch AND a matching `if` in a
 * serializer. Mirrors, on the frontend, the same principle Tsubasa's
 * own DF_REGISTRY / EXPR_REGISTRY apply on the backend: a declarative
 * table instead of a hand-maintained chain of conditionals.
 */

export type PortArity = "single" | "list";

export interface Port {
    /** Matches the `id` prop of the <Handle> rendered for this port. */
    handleId: string;
    /** Backend field name this port fills on the serialized step. */
    field: string;
    arity: PortArity;
    /** Short label rendered next to the handle. */
    label: string;
}

/**
 * Incoming ports: this node is the edge TARGET, pulling in a parent
 * DFNode. Node types not listed here get the implicit single default
 * port below (handle id "dataflow-in").
 *
 * `field` here is the **wire JSON key**, not the backend dataclass
 * attribute name — Tsubasa's graph parser pops `"input"`/`"right"`/
 * `"other"` off the step dict and assigns them to the `source`/`right`/
 * `other` Python fields respectively (`DF_EDGE_KEYS` in `parser.py`).
 * The primary parent link is therefore serialized as `"input"`, even
 * though it becomes `DFNode.source` once parsed.
 *
 * `scan`/`file_reader` are roots (backend `DFSpec(..., root=True)`)
 * and intentionally declare zero incoming ports.
 */
export const NODE_INCOMING_PORTS: Record<string, Port[]> = {
    scan: [],
    file_reader: [],
    join: [
        { handleId: "input", field: "input", arity: "single", label: "in" },
        { handleId: "right", field: "right", arity: "single", label: "right" },
    ],
    join_asof: [
        { handleId: "input", field: "input", arity: "single", label: "in" },
        { handleId: "right", field: "right", arity: "single", label: "right" },
    ],
    cross_join: [
        { handleId: "input", field: "input", arity: "single", label: "in" },
        { handleId: "right", field: "right", arity: "single", label: "right" },
    ],
    // Tsubasa's StackNode (polars_ast/df_nodes.py) wires its second
    // DataFrame through the "other" field/wire-key — same shape as a
    // join's "right", just a different backend key.
    // Stacking is associative, so it takes as many frames as you wire in:
    // `other` keeps the two-frame shape every saved graph already uses,
    // and `others` collects the rest (Tsubasa's StackNode reads both).
    // Before this, a three-way stack meant chaining two nodes for what is
    // one operation.
    vstack: [
        { handleId: "input", field: "input", arity: "single", label: "in" },
        { handleId: "other", field: "other", arity: "single", label: "other" },
        { handleId: "others", field: "others", arity: "list", label: "+" },
    ],
    hstack: [
        { handleId: "input", field: "input", arity: "single", label: "in" },
        { handleId: "other", field: "other", arity: "single", label: "other" },
        { handleId: "others", field: "others", arity: "list", label: "+" },
    ],
    // Structural if/else. `then`/`otherwise` each take a *group* node,
    // which serializes to a `subgraph` step — Tsubasa's BranchNode binds
    // its own upstream frame into the chosen branch's input port and
    // delegates. Incoming ports, like a join's `right`: the branch reads
    // the pipelines, it does not push expressions into them.
    branch: [
        { handleId: "input", field: "input", arity: "single", label: "in" },
        { handleId: "then", field: "then", arity: "single", label: "then" },
        { handleId: "otherwise", field: "otherwise", arity: "single", label: "else" },
    ],
};

export const DEFAULT_INCOMING_PORT: Port = {
    handleId: "dataflow-in",
    field: "input",
    arity: "single",
    label: "in",
};

/**
 * Outgoing ports: this node is the edge SOURCE, pushing to one or
 * more expression (or, for `to_frame`, Series-chain) children.
 * Child-expression edges always point parent -> child in this editor.
 *
 * `to_frame`'s entry exists here only so AstNodeCard renders its
 * connector — the builder never consults it. Its actual content can be
 * either a plain expression or a Series chain, resolved by a dedicated
 * builder method (`GraphDocumentBuilder.buildToFrameStep`) instead of
 * the generic port loop — the same reason Tsubasa registers `to_frame`
 * as a custom callable in `DF_REGISTRY` instead of a generic `DFSpec`.
 */
export const NODE_OUTGOING_PORTS: Record<string, Port[]> = {
    filter: [{ handleId: "predicate", field: "predicate", arity: "single", label: "pred" }],
    select: [{ handleId: "expr", field: "exprs", arity: "list", label: "cols" }],
    with_columns: [{ handleId: "expr", field: "exprs", arity: "list", label: "cols" }],
    to_frame: [{ handleId: "expr", field: "expr", arity: "single", label: "cols" }],
    group_by: [{ handleId: "agg", field: "aggs", arity: "list", label: "aggs" }],
    binary: [
        { handleId: "left", field: "left", arity: "single", label: "L" },
        { handleId: "right", field: "right", arity: "single", label: "R" },
    ],
    unary: [{ handleId: "expr", field: "operand", arity: "single", label: "x" }],
    chain: [{ handleId: "operand", field: "operands", arity: "list", label: "ops" }],
    alias: [{ handleId: "expr", field: "expr", arity: "single", label: "expr" }],
    cast: [{ handleId: "expr", field: "expr", arity: "single", label: "expr" }],
    over: [{ handleId: "expr", field: "expr", arity: "single", label: "expr" }],
    sort_expr: [{ handleId: "expr", field: "expr", arity: "single", label: "expr" }],
    call: [{ handleId: "on", field: "on", arity: "single", label: "on" }],
    when: [
        { handleId: "condition", field: "condition", arity: "single", label: "cond" },
        { handleId: "then", field: "then", arity: "single", label: "then" },
        { handleId: "otherwise", field: "otherwise", arity: "single", label: "else" },
    ],
};

/** Node types whose visual connector shape is declared here rather than the generic default. */
export function hasDeclaredPorts(nodeType: string): boolean {
    return nodeType in NODE_INCOMING_PORTS || nodeType in NODE_OUTGOING_PORTS;
}

export function incomingPortsFor(nodeType: string): Port[] {
    const override = NODE_INCOMING_PORTS[nodeType];
    return override !== undefined ? override : [DEFAULT_INCOMING_PORT];
}

export function outgoingPortsFor(nodeType: string): Port[] {
    return NODE_OUTGOING_PORTS[nodeType] ?? [];
}

export function isValidConnection(
    connection: { source: string | null; target: string | null; targetHandle?: string | null },
    nodes: { id: string; data: { isExpression: boolean; nodeType: string } }[],
    _isSeriesNode?: (node: { data: { isExpression: boolean; nodeType: string } }) => boolean,
): boolean {
    if (!connection.source || !connection.target) return true;
    if (connection.source === connection.target) return false;
    const src = nodes.find(n => n.id === connection.source);
    const tgt = nodes.find(n => n.id === connection.target);
    if (!src || !tgt) return true;

    const srcIsDf = !src.data.isExpression;
    const targetHandle = connection.targetHandle ?? "dataflow-in";

    // get_column's DataFrame bridge — needs a DF source.
    if (targetHandle === "df_source") return srcIsDf;

    // to_frame accepts both DF and Series on its default port.
    if (tgt.data.nodeType === "to_frame" && targetHandle === "dataflow-in") return true;

    // DF pipeline steps only accept DF sources on their pipeline ports.
    if (!tgt.data.isExpression) return srcIsDf;

    return true;
}
