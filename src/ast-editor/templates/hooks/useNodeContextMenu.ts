import { useState, useCallback, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Node, Edge, NodeMouseHandler } from "reactflow";
import type { AstNodeData } from "../../../shared/types/ast_types";
import { eventBus } from "../../../shared/utils/event_bus";

export interface ContextMenuState {
    x: number;
    y: number;
    nodeId: string;
}

/**
 * Right-click context menu state plus the node operations it triggers
 * (add child, duplicate, delete). Closes itself on `OPEN_NODE_PANEL` —
 * the same event `useNodeSelection` listens for to open the drawer —
 * instead of taking a direct dependency on that hook.
 */
export function useNodeContextMenu(
    nodes: Node<AstNodeData>[],
    setNodes: Dispatch<SetStateAction<Node<AstNodeData>[]>>,
    setEdges: Dispatch<SetStateAction<Edge[]>>,
    selectedNodeId: string | undefined,
    clearSelection: () => void,
) {
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

    const closeContextMenu = useCallback(() => setContextMenu(null), []);

    const handleNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
        event.preventDefault();
        setContextMenu({
            x: (event as unknown as MouseEvent).clientX,
            y: (event as unknown as MouseEvent).clientY,
            nodeId: node.id,
        });
    }, []);

    useEffect(() => {
        eventBus.subscribe("OPEN_NODE_PANEL", closeContextMenu);
        return () => {
            eventBus.unsubscribe("OPEN_NODE_PANEL", closeContextMenu);
        };
    }, [closeContextMenu]);

    const handleAddChild = useCallback((nodeId: string) => {
        const parentNode = nodes.find(n => n.id === nodeId);
        if (!parentNode) return;

        const newId = `ast_new_${Date.now()}`;
        const newNode: Node<AstNodeData> = {
            id: newId,
            type: "astNode",
            position: {
                x: parentNode.position.x + 50,
                y: parentNode.position.y + 120,
            },
            data: {
                nodeType: "col",
                label: "Col()",
                properties: { name: "" },
                stepIndex: -1,
                isExpression: true,
            },
        };

        setNodes(nds => [...nds, newNode]);
        setEdges(eds => [...eds, {
            id: `e_${nodeId}_${newId}`,
            source: nodeId,
            target: newId,
            animated: true,
            style: { stroke: "var(--color-neon-pink)", strokeWidth: 4, filter: "drop-shadow(0 0 5px var(--color-neon-pink))" },
            type: "smoothstep",
        }]);
    }, [nodes, setNodes, setEdges]);

    const handleDuplicate = useCallback((nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const newId = `ast_dup_${Date.now()}`;
        const newNode: Node<AstNodeData> = {
            ...node,
            id: newId,
            position: {
                x: node.position.x + 30,
                y: node.position.y + 30,
            },
            data: { ...node.data },
        };
        setNodes(nds => [...nds, newNode]);
    }, [nodes, setNodes]);

    const handleDeleteNode = useCallback((nodeId: string) => {
        setNodes(nds => nds.filter(n => n.id !== nodeId));
        setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
        if (selectedNodeId === nodeId) {
            clearSelection();
        }
    }, [setNodes, setEdges, selectedNodeId, clearSelection]);

    return {
        contextMenu,
        closeContextMenu,
        handleNodeContextMenu,
        handleAddChild,
        handleDuplicate,
        handleDeleteNode,
    };
}
