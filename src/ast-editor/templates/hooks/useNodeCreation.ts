import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Node } from "reactflow";
import type { AstNodeData } from "../../../shared/types/ast_types";
import { getNodeLabel } from "../../../shared/utils/node_labels";
import { CATEGORIES } from "../../organisms/data/node-categories";

/**
 * How new nodes enter the canvas: dragged in from the NodeLibrary
 * sidebar, or added directly from the HelpModal's node reference. Both
 * end up building the same `Node<AstNodeData>` shape and appending it
 * to `nodes` — the only real difference is where the preset properties
 * and screen position come from.
 */
export function useNodeCreation(
    nodes: Node<AstNodeData>[],
    setNodes: Dispatch<SetStateAction<Node<AstNodeData>[]>>,
    screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number },
    getViewport: () => { x: number; y: number; zoom: number },
) {
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();

        const rawData = event.dataTransfer.getData("application/reactflow");
        if (!rawData) return;

        try {
            const { nodeType, isExpression, presetProperties } = JSON.parse(rawData);
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newId = `ast_drop_${Date.now()}`;
            const label = getNodeLabel(nodeType, presetProperties || {});

            const newNode: Node<AstNodeData> = {
                id: newId,
                type: "astNode",
                position,
                data: {
                    nodeType,
                    label,
                    properties: presetProperties || {},
                    stepIndex: -1,
                    isExpression: !!isExpression,
                },
            };

            setNodes((nds) => nds.concat(newNode));
        } catch (err) {
            console.error("Failed to drop node:", err);
        }
    }, [screenToFlowPosition, setNodes]);

    const handleAddNodeDirectly = useCallback((nodeType: string, method?: string) => {
        let presetProperties: Record<string, any> = {};
        if (nodeType === "call" && method) {
            presetProperties = { method };
        } else {
            // Find default properties from NodeLibrary CATEGORIES if exists
            for (const cat of CATEGORIES) {
                const match = cat.items.find(i => i.type === nodeType && (!method || i.method === method));
                if (match && match.presetProperties) {
                    presetProperties = { ...match.presetProperties };
                    break;
                }
            }
        }

        const viewport = getViewport();
        // Use center of the viewport
        const x = -viewport.x / viewport.zoom + window.innerWidth / 2 / viewport.zoom - 50;
        const y = -viewport.y / viewport.zoom + window.innerHeight / 2 / viewport.zoom - 40;

        const offsetIndex = nodes.length % 8;
        const position = {
            x: x + offsetIndex * 25,
            y: y + offsetIndex * 25
        };

        const newId = `ast_help_${Date.now()}`;
        const label = getNodeLabel(nodeType, presetProperties);

        // Find if it's expression
        let isExpression = true;
        for (const cat of CATEGORIES) {
            const match = cat.items.find(i => i.type === nodeType);
            if (match) {
                isExpression = match.isExpression;
                break;
            }
        }

        const newNode: Node<AstNodeData> = {
            id: newId,
            type: "astNode",
            position,
            data: {
                nodeType,
                label,
                properties: presetProperties,
                stepIndex: -1,
                isExpression
            }
        };

        setNodes((nds) => nds.concat(newNode));
    }, [nodes, setNodes, getViewport]);

    return { onDragOver, onDrop, handleAddNodeDirectly };
}
