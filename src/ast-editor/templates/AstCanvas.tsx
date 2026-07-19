
import React, { useCallback } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    useReactFlow,
    ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import { AstNodeCard } from "../molecules/AstNodeCard";
import { Toolbar } from "../organisms/Toolbar";
import { NodeContextMenu } from "../molecules/NodeContextMenu";
import { NodePanel } from "../organisms/NodePanel";
import { ResultTable } from "../organisms/ResultTable";
import { NodeLibrary } from "../organisms/NodeLibrary";
import { HelpModal } from "../organisms/HelpModal";
import { ExamplesLibrary } from "../organisms/ExamplesLibrary";

import { eventBus } from "../../shared/utils/event_bus";
import { columnStore } from "../../shared/utils/column_store";
import type { AstNodeData } from "../../shared/types/ast_types";
import { GroupNode } from "../molecules/GroupNode";

import { useNodeSelection } from "./hooks/useNodeSelection";
import { useNodeContextMenu } from "./hooks/useNodeContextMenu";
import { useNodeGrouping } from "./hooks/useNodeGrouping";
import { useCanvasExecution } from "./hooks/useCanvasExecution";
import { useCanvasIO } from "./hooks/useCanvasIO";
import { useNodeCreation } from "./hooks/useNodeCreation";
import { useEdgeConnections } from "./hooks/useEdgeConnections";
import { useCanvasModals } from "./hooks/useCanvasModals";

const nodeTypes = {
    astNode: AstNodeCard,
    groupNode: GroupNode,
};

function AstCanvasInner() {
    const [nodes, setNodes, onNodesChange] = useNodesState<AstNodeData>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const { zoomIn, zoomOut, fitView, screenToFlowPosition, getViewport } = useReactFlow();

    const { helpOpen, openHelp, closeHelp, examplesOpen, openExamples, closeExamples } = useCanvasModals();

    const {
        selectedNode,
        activeSelectedNode,
        drawerOpen,
        handleNodeClick,
        handleDrawerChange,
        closeDrawer,
        clearSelection,
    } = useNodeSelection(nodes, setNodes);

    const {
        contextMenu,
        closeContextMenu,
        handleNodeContextMenu,
        handleAddChild,
        handleDuplicate,
        handleDeleteNode,
    } = useNodeContextMenu(nodes, setNodes, setEdges, selectedNode?.id, clearSelection);

    const {
        onSelectionChange,
        handleGroupSelection,
        handleUngroupSelection,
        hasSelection,
        hasGroupSelected,
    } = useNodeGrouping(setNodes);

    const {
        isExecuting,
        executionResult,
        executionError,
        resultModalOpen,
        setResultModalOpen,
        handleExecute,
        handleExecuteWithDocument,
        resetExecutionState,
        setExecutionError,
    } = useCanvasExecution(nodes, edges);

    const {
        fileInputRef,
        handleLoadJson,
        handleFileChange,
        handleExportJson,
        handleLoadExample,
    } = useCanvasIO(nodes, edges, setNodes, setEdges, fitView, {
        onLoadSuccess: resetExecutionState,
        onLoadError: setExecutionError,
        onExampleLoaded: closeExamples,
    });

    const { onDragOver, onDrop, handleAddNodeDirectly } = useNodeCreation(nodes, setNodes, screenToFlowPosition, getViewport);

    const { onConnect, isConnectionValid } = useEdgeConnections(nodes, setEdges);

    // Node click → select node, and close any open context menu
    const onNodeClick = useCallback((event: any, node: any) => {
        handleNodeClick(event, node);
        closeContextMenu();
    }, [handleNodeClick, closeContextMenu]);

    // Clear canvas
    const handleClear = useCallback(() => {
        setNodes([]);
        setEdges([]);
        resetExecutionState();
        clearSelection();
        columnStore.clear();
    }, [setNodes, setEdges, resetExecutionState, clearSelection]);

    // Close context menu on pane click
    const handlePaneClick = useCallback(() => {
        closeContextMenu();
    }, [closeContextMenu]);

    return (
        <div className="flex flex-col h-full w-full">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                type="file"
                onChange={handleFileChange}
            />

            {/* Toolbar */}
            <Toolbar
                isExecuting={isExecuting}
                onClear={handleClear}
                onExecute={() => handleExecute()}
                onExecuteWithDocument={handleExecuteWithDocument}
                onExportJson={handleExportJson}
                onFitView={() => fitView({ padding: 0.2 })}
                onLoadJson={handleLoadJson}
                onZoomIn={() => zoomIn()}
                onZoomOut={() => zoomOut()}
                onOpenHelp={openHelp}
                onOpenExamplesLibrary={openExamples}
                onGroupSelection={handleGroupSelection}
                onUngroupSelection={handleUngroupSelection}
                hasSelection={hasSelection}
                hasGroupSelected={hasGroupSelected}
            />

            {/* Split layout: Sidebar & ReactFlow Canvas */}
            <div className="flex-1 flex relative overflow-hidden bg-transparent" style={{ minHeight: 500 }}>
                <NodeLibrary />

                <div
                    className="flex-1 h-full relative"
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                >
                    <ReactFlow
                        edges={edges}
                        fitView
                        nodeTypes={nodeTypes}
                        nodes={nodes}
                        style={{ background: "transparent" }}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        onSelectionChange={onSelectionChange}
                        onNodeContextMenu={handleNodeContextMenu}
                        onNodesChange={onNodesChange}
                        onPaneClick={handlePaneClick}
                        onConnect={onConnect}
                        isValidConnection={isConnectionValid}
                    >
                        <Background
                            color="rgba(255, 255, 255, 0.4)"
                            gap={20}
                        />
                        <Controls
                            className="!bg-[var(--color-dark-glass)] !border-blue-500/50 !rounded-lg !shadow-[0_0_15px_var(--color-neon-cyan)] [&>button]:!bg-transparent [&>button]:!text-white [&>button:hover]:!bg-[var(--color-neon-cyan)]"
                            showInteractive={false}
                        />
                        <MiniMap
                            className="!bg-[var(--color-dark-glass)] !border-2 !border-blue-500/50 !rounded-lg"
                            maskColor="rgba(0, 0, 0, 0.7)"
                            nodeColor={(node) => {
                                const data = node.data as AstNodeData;
                                const colors: Record<string, string> = {
                                    col: "#3b82f6", lit: "#6b7280", binary: "#f97316",
                                    filter: "#ef4444", select: "#14b8a6", with_columns: "#14b8a6",
                                    scan: "#3b82f6", group_by: "#22c55e", sort: "#8b5cf6",
                                    join: "#f97316",
                                };
                                return colors[data?.nodeType] || "#6b7280";
                            }}
                        />
                    </ReactFlow>

                    {/* Context Menu */}
                    {contextMenu && (
                        <NodeContextMenu
                            isOpen={!!contextMenu}
                            nodeId={contextMenu.nodeId}
                            x={contextMenu.x}
                            y={contextMenu.y}
                            onAddChild={handleAddChild}
                            onClose={closeContextMenu}
                            onDelete={handleDeleteNode}
                            onDuplicate={handleDuplicate}
                            onEditProperties={(nodeId) => {
                                eventBus.notify("OPEN_NODE_PANEL", nodeId);
                            }}
                        />
                    )}
                </div>
            </div>

            {/* DataFrame Panel / Modal */}
            <ResultTable
                error={executionError}
                isOpen={resultModalOpen}
                result={executionResult}
                onClose={() => setResultModalOpen(false)}
            />

            {/* Properties Drawer */}
            <NodePanel
                isOpen={drawerOpen}
                node={activeSelectedNode}
                onClose={closeDrawer}
                onChange={handleDrawerChange}
                allNodes={nodes}
                allEdges={edges}
            />

            {/* Help/Reference Modal */}
            <HelpModal
                isOpen={helpOpen}
                onClose={closeHelp}
                onAddNode={handleAddNodeDirectly}
            />

            {/* Examples Library Modal */}
            <ExamplesLibrary
                isOpen={examplesOpen}
                onClose={closeExamples}
                onLoad={handleLoadExample}
            />

        </div>
    );
}

export const AstCanvas: React.FC = () => {
    return (
        <ReactFlowProvider>
            <AstCanvasInner />
        </ReactFlowProvider>
    );
};
