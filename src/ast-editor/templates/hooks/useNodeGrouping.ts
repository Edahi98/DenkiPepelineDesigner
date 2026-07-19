import { useState, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Node } from "reactflow";
import type { AstNodeData } from "../../../shared/types/ast_types";

/**
 * ReactFlow multi-selection plus grouping/ungrouping it into a
 * `groupNode`. Only touches `setNodes` — it doesn't need to know about
 * edges, execution, or anything else the canvas tracks.
 */
export function useNodeGrouping(setNodes: Dispatch<SetStateAction<Node<AstNodeData>[]>>) {
    const [selectedFlowNodes, setSelectedFlowNodes] = useState<Node[]>([]);

    const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
        setSelectedFlowNodes(nodes);
    }, []);

    const handleGroupSelection = useCallback(() => {
        const selected = selectedFlowNodes.filter(n => n.type !== "groupNode");
        if (selected.length < 2) return;

        const minX = Math.min(...selected.map(n => n.position.x));
        const minY = Math.min(...selected.map(n => n.position.y));
        const maxX = Math.max(...selected.map(n => n.position.x + (n.width || 200)));
        const maxY = Math.max(...selected.map(n => n.position.y + (n.height || 100)));

        const padding = 40;
        const groupWidth = maxX - minX + padding * 2;
        const groupHeight = maxY - minY + padding * 2;

        const groupId = `group_${Date.now()}`;
        const newGroupNode: Node<AstNodeData> = {
            id: groupId,
            type: "groupNode",
            position: { x: minX - padding, y: minY - padding - 20 },
            style: { width: groupWidth, height: groupHeight + 20 },
            data: {
                nodeType: "groupNode",
                label: "Subgrafo",
                properties: {},
                stepIndex: -1,
                isExpression: false
            },
            zIndex: -1, // Keep behind nodes
        };

        setNodes(nds => {
            const newNodes = nds.map((n): Node<AstNodeData> => {
                if (selected.find(s => s.id === n.id)) {
                    return {
                        ...n,
                        parentNode: groupId,
                        extent: "parent" as const,
                        position: {
                            x: n.position.x - (minX - padding),
                            y: n.position.y - (minY - padding - 20)
                        }
                    };
                }
                return n;
            });
            return [...newNodes, newGroupNode];
        });
    }, [selectedFlowNodes, setNodes]);

    const handleUngroupSelection = useCallback(() => {
        const groupNodesSelected = selectedFlowNodes.filter(n => n.type === "groupNode");
        if (groupNodesSelected.length === 0) return;

        const groupIds = new Set(groupNodesSelected.map(g => g.id));

        setNodes(nds => {
            const filtered = nds.filter(n => !groupIds.has(n.id)); // Remove the group nodes
            return filtered.map((n): Node<AstNodeData> => {
                if (n.parentNode && groupIds.has(n.parentNode)) {
                    // Find the group to restore absolute position
                    const group = groupNodesSelected.find(g => g.id === n.parentNode);
                    const absoluteX = (group?.position.x || 0) + n.position.x;
                    const absoluteY = (group?.position.y || 0) + n.position.y;

                    return {
                        ...n,
                        parentNode: undefined,
                        extent: undefined,
                        position: { x: absoluteX, y: absoluteY }
                    };
                }
                return n;
            });
        });
    }, [selectedFlowNodes, setNodes]);

    const hasSelection = selectedFlowNodes.filter(n => n.type !== "groupNode").length >= 2;
    const hasGroupSelected = selectedFlowNodes.some(n => n.type === "groupNode");

    return {
        selectedFlowNodes,
        onSelectionChange,
        handleGroupSelection,
        handleUngroupSelection,
        hasSelection,
        hasGroupSelected,
    };
}
