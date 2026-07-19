import { memo, useState } from "react";
import { Position } from "reactflow";
import { NodeHandle } from "../atoms/NodeHandle";
import { NODE_TYPE_COLORS } from "../../shared/types/ast_types";
import type { AstNodeData } from "../../shared/types/ast_types";
import { eventBus } from "../../shared/utils/event_bus";
import { hasDeclaredPorts, incomingPortsFor, outgoingPortsFor } from "../../shared/algoritmos/node_ports";
import {
    Columns3, Hash, GitBranch, Minus, Tag, HelpCircle,
    ArrowRightLeft, Layers, ArrowUpDown, Database, TableProperties,
    Filter, Group, Merge, Scissors, ChevronsUp, ChevronsDown,
    PenLine, Trash2, XCircle, PlusCircle, Fingerprint, Expand,
    RotateCcw, FlipVertical, Shuffle, MoveVertical, Download,
    Info, RefreshCw, FunctionSquare, CircleDot, Settings,
    // Series AST icons
    Zap, List, Calculator, Sigma, TrendingUp, CircleOff,
    CheckCircle, Percent, TrendingDown, MousePointer, Grid3x3,
    Repeat, Plus, ArrowDown, ArrowUp, Award, Calendar, Clock,
    Box, Ampersand
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
    // DataFrame AST icons
    Columns3, Hash, GitBranch, Minus, FunctionSquare, Tag, HelpCircle,
    ArrowRightLeft, Layers, ArrowUpDown, Database, TableProperties,
    Filter, Group, Merge, Scissors, ChevronsUp, ChevronsDown,
    PenLine, Trash2, XCircle, PlusCircle, Fingerprint, Expand,
    RotateCcw, FlipVertical, Shuffle, MoveVertical, Download,
    Info, RefreshCw,
    // Series AST icons
    Zap, List, Calculator, Sigma, TrendingUp, CircleOff,
    CheckCircle, Percent, TrendingDown, MousePointer, Grid3x3,
    Repeat, Plus, ArrowDown, ArrowUp, Award, Calendar, Clock,
    Box, Ampersand
};

interface AstNodeCardProps {
    id: string;
    data: AstNodeData;
    selected: boolean;
    /**
     * Optional small badge rendered next to the header label.  Used by
     * node types that need to surface a state (e.g. the chain node
     * shows its operator: "OR" or "AND").  Defaults to undefined —
     * existing callers don't need to change.
     */
    headerBadge?: { label: string; color: string };
}

export const AstNodeCard = memo(({ id, data, selected, headerBadge }: AstNodeCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const colors = NODE_TYPE_COLORS[data.nodeType] || {
        bg: "#6b7280", border: "#4b5563", text: "#ffffff", icon: "CircleDot"
    };

    const IconComponent = ICON_MAP[colors.icon] || CircleDot;

    // Build a summary of key properties
    const propEntries = Object.entries(data.properties).slice(0, 3);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative glass-panel"
            style={{
                minWidth: 180,
                maxWidth: 260,
                borderRadius: 16,
                boxShadow: selected
                    ? `0 0 0 2px ${colors.bg}, 0 10px 25px -5px rgba(0, 0, 0, 0.5)`
                    : `0 4px 15px rgba(0,0,0,0.2)`,
                background: "var(--color-dark-glass)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${selected ? colors.bg : "rgba(255,255,255,0.1)"}`,
                transition: "all 0.3s ease",
            }}
        >
            {/* Settings Button on Hover */}
            {isHovered && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        eventBus.notify("OPEN_NODE_PANEL", id);
                    }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    onContextMenu={(e) => {
                        // Let right-click pass through to parent for context menu
                        e.stopPropagation();
                    }}
                    style={{
                        position: "absolute",
                        top: "-14px",
                        right: "8px",
                        backgroundColor: colors.bg,
                        color: "#fff",
                        borderRadius: "50%",
                        padding: "6px",
                        boxShadow: `0 0 15px ${colors.bg}`,
                        border: "2px solid #fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                        transition: "transform 0.1s ease, background-color 0.1s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#1a7a82";
                        e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#229AA4";
                        e.currentTarget.style.transform = "scale(1)";
                    }}
                    title="Editar propiedades"
                >
                    <Settings size={14} className="stroke-[2.5]" />
                </button>
            )}

            {/* Header */}
            <div
                style={{
                    background: colors.bg,
                    color: "#fff",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    borderTopLeftRadius: 15,
                    borderTopRightRadius: 15,
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                }}
            >
                <IconComponent size={16} strokeWidth={2.5} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {data.label}
                </span>
                {headerBadge && (
                    <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                        style={{
                            background: headerBadge.color,
                            color: "#E7D8D3",
                            marginLeft: "auto",
                        }}
                    >
                        {headerBadge.label}
                    </span>
                )}
            </div>

            {/* Body */}
            <div style={{ padding: "8px 12px", fontSize: 11, color: "#e0e0e0", borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}>
                {propEntries.length > 0 ? (
                    propEntries.map(([key, val]) => (
                        <div key={key} style={{ display: "flex", gap: 4, marginBottom: 2 }}>
                            <span style={{ color: colors.bg, fontWeight: 700 }}>{key}:</span>
                            <span style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 150,
                                color: "#fff",
                                fontWeight: "normal"
                            }}>
                                {typeof val === "object" ? JSON.stringify(val) : String(val)}
                            </span>
                        </div>
                    ))
                ) : (
                    <span style={{ color: "#aaa", fontStyle: "italic", fontWeight: "bold" }}>No properties</span>
                )}
            </div>

            {/* Handles */}
            <NodeHandles nodeType={data.nodeType} isExpression={!!data.isExpression} />
        </div>
    );
});

AstNodeCard.displayName = "AstNodeCard";


/**
 * Renders the right combination of source/target handles for a given
 * node type.  By default a node has a single target on top (dataflow
 * in) and a single source on bottom (dataflow out).
 *
 * The connector *shape* for any node with expression/DataFrame children
 * (filter's predicate, select/with_columns' exprs, group_by's aggs,
 * join's two inputs, binary/when/chain's operands, ...) is declared
 * once in `node_ports.ts` and read from there — never re-declared here
 * as a parallel `case`. That registry is also what
 * `GraphDocumentBuilder` reads to resolve which edge fills which
 * backend field, so rendering and serialization can never disagree
 * about a node type's shape.
 *
 * IMPORTANT: child-expression edges point FROM the parent TO the
 * child (the parent is the source). This matches both `ast_to_flow.ts`
 * (which always creates ``source: parent, target: child``) and
 * `dag_builder.ts` (which reads child expressions from outgoing edges).
 */
interface NodeHandlesProps {
    nodeType: string;
    isExpression: boolean;
}

/** A handful of Series-only quirks kept as small, explicit exceptions
 * rather than generalized into node_ports.ts — they're peculiarities
 * of individual Series nodes, not part of the DF/Expr port contract
 * this registry exists to keep in sync with Tsubasa. */
const SERIES_EXTRA_TARGETS: Record<string, { handleId: string; label: string }[]> = {
    contains_any: [{ handleId: "patterns_series", label: "patterns" }],
    is_in: [{ handleId: "values_series", label: "vals" }],
    append: [{ handleId: "other", label: "other" }],
    // get_column is the DF -> Series bridge: this is the real DataFrame
    // the column is read from. dag_builder.ts's findDfBridgeSource reads
    // this same handle id to wire the backend's df_source. Rendered as
    // get_column's *primary* (only) target below — see SERIES_CHAIN_ROOTS
    // — since a chain root never receives a chain-continuation edge, so
    // there is exactly one obvious place to plug a DataFrame into.
    get_column: [{ handleId: "df_source", label: "df" }],
};
const SERIES_EXTRA_SOURCES: Record<string, { handleId: string; label: string }[]> = {};

/** Series chain roots — never receive a chain-continuation edge on the
 * generic "expr-in" handle, since there is no preceding Series node.
 * Their own extra target (if any; only get_column has one) is promoted
 * to the primary Left position instead of a secondary Top one, so
 * connecting a DataFrame has exactly one obvious spot instead of two
 * competing handles on the same card. */
const SERIES_CHAIN_ROOTS = new Set(["get_column", "from_list", "from_scalar"]);

/** Horizontal (Top/Bottom) or vertical (Left/Right) spread for N handles stacked on one side. */
const spread = (i: number, n: number) => (n <= 1 ? 0 : (i - (n - 1) / 2) * 26);

const NodeHandles = ({ nodeType, isExpression }: NodeHandlesProps) => {
    if (hasDeclaredPorts(nodeType)) {
        const outPorts = outgoingPortsFor(nodeType);

        if (isExpression) {
            // Composite expression (binary, unary, chain, alias, cast, over,
            // sort_expr, call, when): one incoming chain link, N outgoing
            // operand/child ports declared in node_ports.ts.
            return (
                <>
                    <NodeHandle position={Position.Left} type="target" id="expr-in" />
                    {outPorts.map((p, i) => (
                        <NodeHandle key={p.handleId} position={Position.Right} type="source" id={p.handleId}
                            offsetY={spread(i, outPorts.length)} label={p.label} />
                    ))}
                    <NodeHandle position={Position.Bottom} type="source" id="dataflow-out" label="out" />
                </>
            );
        }

        // DF-composite node (filter, select, with_columns, group_by,
        // join/join_asof/cross_join, to_frame): N incoming DF ports + N
        // outgoing expression ports, both declared in node_ports.ts.
        const inPorts = incomingPortsFor(nodeType);
        return (
            <>
                {inPorts.map((p, i) => (
                    <NodeHandle key={p.handleId} position={Position.Top} type="target" id={p.handleId}
                        offsetY={spread(i, inPorts.length)} label={p.label} />
                ))}
                {outPorts.map((p, i) => (
                    <NodeHandle key={p.handleId} position={Position.Right} type="source" id={p.handleId}
                        offsetY={spread(i, outPorts.length)} label={p.label} />
                ))}
                <NodeHandle position={Position.Bottom} type="source" id="dataflow-out" label="out" />
            </>
        );
    }

    if (isExpression) {
        const extraTargets = SERIES_EXTRA_TARGETS[nodeType] ?? [];
        const isChainRoot = SERIES_CHAIN_ROOTS.has(nodeType);
        return (
            <>
                {isChainRoot ? (
                    // Chain root: no "expr-in" (nothing ever feeds it), so
                    // its own extra target (get_column's DataFrame bridge)
                    // becomes the single, primary Left-side handle.
                    extraTargets.map(t => (
                        <NodeHandle key={t.handleId} position={Position.Left} type="target" id={t.handleId} label={t.label} />
                    ))
                ) : (
                    <>
                        <NodeHandle position={Position.Left} type="target" id="expr-in" label="in" />
                        {extraTargets.map(t => (
                            <NodeHandle key={t.handleId} position={Position.Top} type="target" id={t.handleId} label={t.label} />
                        ))}
                    </>
                )}
                <NodeHandle position={Position.Bottom} type="source" id="dataflow-out" label="out" />
                {(SERIES_EXTRA_SOURCES[nodeType] ?? []).map(s => (
                    <NodeHandle key={s.handleId} position={Position.Right} type="source" id={s.handleId} label={s.label} />
                ))}
            </>
        );
    }

    // Plain default DF step: top target + bottom source.
    return (
        <>
            <NodeHandle position={Position.Top} type="target" id="dataflow-in" label="in" />
            <NodeHandle position={Position.Bottom} type="source" id="dataflow-out" label="out" />
        </>
    );
};

