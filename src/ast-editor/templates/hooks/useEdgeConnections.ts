import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { addEdge } from "reactflow";
import type { Node, Edge, Connection } from "reactflow";
import type { AstNodeData } from "../../../shared/types/ast_types";
import { isSeriesNode } from "../../../shared/utils/flow_to_ast";
import { isValidConnection as validateConnection } from "../../../shared/algoritmos/node_ports";

/** Drawing edges between nodes, and rejecting structurally-invalid ones before they're ever drawn. */
export function useEdgeConnections(
    nodes: Node<AstNodeData>[],
    setEdges: Dispatch<SetStateAction<Edge[]>>,
) {
    const onConnect = useCallback((connection: Connection) => {
        // Stamp a stable insertion order on this handle so list-valued fields
        // (with_columns.exprs, group_by.aggs, chain.operands, ...) keep their
        // meaning if the user later drags nodes around the canvas — order is
        // fixed at connect time, never recomputed from live x/y position.
        setEdges((eds) => {
            const order = eds.filter(
                e => e.source === connection.source && e.sourceHandle === connection.sourceHandle
            ).length;
            return addEdge({
                ...connection,
                animated: true,
                style: { stroke: "var(--color-neon-pink)", strokeWidth: 4, filter: "drop-shadow(0 0 5px var(--color-neon-pink))" },
                type: "smoothstep",
                data: { order },
            }, eds);
        });
    }, [setEdges]);

    // Rejects a connection the canvas can already tell is structurally
    // wrong (a DataFrame wired into an expression slot, an expression
    // wired into a DataFrame's own pipeline continuation, ...) before it
    // is ever drawn — previously the only feedback was the backend
    // rejecting the exported JSON well after the fact (F11).
    const isConnectionValid = useCallback((connection: Connection) => {
        return validateConnection(connection, nodes, (n) => isSeriesNode(n as Node<AstNodeData>));
    }, [nodes]);

    return { onConnect, isConnectionValid };
}
