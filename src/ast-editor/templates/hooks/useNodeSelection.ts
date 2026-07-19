import { useState, useMemo, useCallback, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Node, NodeMouseHandler } from "reactflow";
import type { AstNodeData } from "../../../shared/types/ast_types";
import { eventBus } from "../../../shared/utils/event_bus";
import { columnStore } from "../../../shared/utils/column_store";
import { getNodeLabel } from "../../../shared/utils/node_labels";

/**
 * Which node is selected, whether its properties drawer (NodePanel) is
 * open, and how an edit made there writes back into the canvas's node
 * list. A self-contained concern: nothing outside this hook needs to
 * know selectedNode/drawerOpen exist except through what it returns.
 *
 * Opening the drawer is event-driven (`OPEN_NODE_PANEL`, fired by the
 * context menu's "Edit properties" action) rather than a prop, mirroring
 * how `columnStore`/`NodePanel` already talk to the rest of the app.
 */
export function useNodeSelection(
    nodes: Node<AstNodeData>[],
    setNodes: Dispatch<SetStateAction<Node<AstNodeData>[]>>,
) {
    const [selectedNode, setSelectedNode] = useState<Node<AstNodeData> | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleNodeClick: NodeMouseHandler = useCallback((_event, node) => {
        setSelectedNode(node as Node<AstNodeData>);
    }, []);

    useEffect(() => {
        const handleOpenPanel = (nodeId: string) => {
            const node = nodes.find(n => n.id === nodeId);
            if (node) {
                setSelectedNode(node);
                setDrawerOpen(true);
            }
        };
        eventBus.subscribe("OPEN_NODE_PANEL", handleOpenPanel);
        return () => {
            eventBus.unsubscribe("OPEN_NODE_PANEL", handleOpenPanel);
        };
    }, [nodes]);

    const handleDrawerChange = useCallback((nodeId: string, updatedProperties: Record<string, any>, newType?: string) => {
        setNodes(nds => {
            const updated = nds.map(n => {
                if (n.id === nodeId) {
                    const finalType = newType || n.data.nodeType;
                    const newLabel = getNodeLabel(finalType, updatedProperties);
                    return {
                        ...n,
                        type: "astNode", // standard react-flow type
                        data: {
                            ...n.data,
                            nodeType: finalType,
                            label: newLabel,
                            properties: updatedProperties,
                        },
                    };
                }
                return n;
            });
            // If a scan node changed, re-extract columns
            const changedNode = updated.find(n => n.id === nodeId);
            if (changedNode && changedNode.data.nodeType === "scan") {
                setTimeout(() => columnStore.extractFromNodes(updated), 0);
            }
            return updated;
        });
    }, [setNodes]);

    // Lookup node again to ensure we pass the most updated copy to NodePanel
    const activeSelectedNode = useMemo(() => {
        return nodes.find(n => n.id === selectedNode?.id) || null;
    }, [nodes, selectedNode?.id]);

    const closeDrawer = useCallback(() => setDrawerOpen(false), []);

    const clearSelection = useCallback(() => {
        setSelectedNode(null);
        setDrawerOpen(false);
    }, []);

    return {
        selectedNode,
        activeSelectedNode,
        drawerOpen,
        handleNodeClick,
        handleDrawerChange,
        closeDrawer,
        clearSelection,
    };
}
