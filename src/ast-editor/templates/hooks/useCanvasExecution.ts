import { useState, useCallback } from "react";
import type { Node, Edge } from "reactflow";
import type { AstNodeData, ExecutionResult } from "../../../shared/types/ast_types";
import { buildExecutionDocument, type GraphDocument } from "../../../shared/algoritmos/dag_builder";
import { pipelineService } from "../../../shared/services/pipeline_service";
import { desktopAdapter } from "../../../shared/adapters/desktop-adapter";
import { eventBus } from "../../../shared/utils/event_bus";
import { columnStore } from "../../../shared/utils/column_store";

/**
 * Building the execution-time GraphDocument from the current canvas,
 * running it against Tsubasa, and the result/error/loading state that
 * drives the ResultTable modal. Depends on the live `nodes`/`edges` so
 * `handleExecute` always serializes the current canvas, same as before
 * this was a hook.
 */
export function useCanvasExecution(nodes: Node<AstNodeData>[], edges: Edge[]) {
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
    const [executionError, setExecutionError] = useState<string | null>(null);
    const [resultModalOpen, setResultModalOpen] = useState(false);

    const runPipeline = useCallback(
        async (pipeline: GraphDocument, testFilePath?: string) => {
            setIsExecuting(true);
            setExecutionError(null);

            try {
                const result = await pipelineService.execute(pipeline, testFilePath);
                setExecutionResult(result);
                setResultModalOpen(true);
                eventBus.notify("PIPELINE_EXECUTED");
                columnStore.extractFromExecutionResult(result);
            } catch (err: any) {
                setExecutionError(err.message || "Error al ejecutar el AST");
                setResultModalOpen(true);
            } finally {
                setIsExecuting(false);
            }
        },
        [],
    );

    const handleExecute = useCallback(async (testFilePath?: string) => {
        let pipeline: GraphDocument;
        try {
            pipeline = buildExecutionDocument(nodes, edges);
        } catch (err: any) {
            setExecutionError(err.message || "Error al construir el pipeline desde el canvas.");
            setResultModalOpen(true);
            return;
        }

        if (!pipeline.graph.outputs.length) {
            setExecutionError("El canvas está vacío o no tiene un nodo de salida válido.");
            setResultModalOpen(true);
            return;
        }

        runPipeline(pipeline, testFilePath);
    }, [nodes, edges, runPipeline]);

    const handleExecuteWithDocument = useCallback(async () => {
        const file = await desktopAdapter.selectFile(['xls', 'xlsx', 'docx', 'doc', 'pdf']);
        if (file) {
            handleExecute(file);
        }
    }, [handleExecute]);

    const resetExecutionState = useCallback(() => {
        setExecutionResult(null);
        setExecutionError(null);
    }, []);

    return {
        isExecuting,
        executionResult,
        executionError,
        resultModalOpen,
        setResultModalOpen,
        handleExecute,
        handleExecuteWithDocument,
        resetExecutionState,
        setExecutionError,
    };
}
