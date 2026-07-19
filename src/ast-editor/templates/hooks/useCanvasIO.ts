import { useCallback, useRef, useEffect } from "react";
import type { Dispatch, SetStateAction, ChangeEvent } from "react";
import type { Node, Edge, FitViewOptions } from "reactflow";
import type { AstNodeData, PipelineJson } from "../../../shared/types/ast_types";
import { buildGraphDocument, type GraphDocument } from "../../../shared/algoritmos/dag_builder";
import { pipelineToFlow } from "../../../shared/utils/ast_to_flow";
import { columnStore } from "../../../shared/utils/column_store";
import { desktopAdapter } from "../../../shared/adapters/desktop-adapter";
import { PIPELINE_EXAMPLES } from "../../examples";

const DEFAULT_PIPELINE: PipelineJson = {
    pipeline: [
        {
            type: "scan",
            data: {
                product: ["Widget", "Gadget", "Widget", "Gadget"],
                revenue: [100, 200, 150, 300],
            },
        },
        {
            type: "filter",
            predicate: {
                type: "binary",
                op: ">",
                left: { type: "col", name: "revenue" },
                right: { type: "lit", value: 100 },
            },
        },
        {
            type: "select",
            exprs: [
                { type: "col", name: "product" },
                {
                    type: "alias",
                    name: "double_revenue",
                    expr: {
                        type: "binary",
                        op: "*",
                        left: { type: "col", name: "revenue" },
                        right: { type: "lit", value: 2 },
                    },
                },
            ],
        },
    ],
};

interface CanvasIOCallbacks {
    /** Fired after a JSON file is successfully loaded onto the canvas. */
    onLoadSuccess?: () => void;
    /** Fired when the selected file isn't valid pipeline JSON. */
    onLoadError?: (message: string) => void;
    /** Fired after an example pipeline has been added/loaded. */
    onExampleLoaded?: () => void;
}

/**
 * Getting a pipeline onto the canvas (default on mount, JSON file
 * upload, example library) and back off it (JSON export). Owns the
 * hidden file input; success/failure/modal-closing side effects that
 * belong to other concerns (resetting execution state, closing the
 * examples modal) are reported through `callbacks` instead of this hook
 * reaching into state it doesn't own.
 */
export function useCanvasIO(
    nodes: Node<AstNodeData>[],
    edges: Edge[],
    setNodes: Dispatch<SetStateAction<Node<AstNodeData>[]>>,
    setEdges: Dispatch<SetStateAction<Edge[]>>,
    fitView: (options?: FitViewOptions) => void,
    callbacks: CanvasIOCallbacks = {},
) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadPipeline = useCallback((pipeline: PipelineJson | GraphDocument) => {
        const { nodes: flowNodes, edges: flowEdges } = pipelineToFlow(pipeline);
        setNodes(flowNodes);
        setEdges(flowEdges);
        setTimeout(() => fitView({ padding: 0.2 }), 100);
        // Extract columns from scan nodes in the loaded pipeline
        setTimeout(() => columnStore.extractFromNodes(flowNodes), 0);
    }, [setNodes, setEdges, fitView]);

    useEffect(() => {
        loadPipeline(DEFAULT_PIPELINE);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLoadJson = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target?.result as string);
                loadPipeline(json);
                callbacks.onLoadSuccess?.();
            } catch (err) {
                callbacks.onLoadError?.(`Invalid JSON: ${err}`);
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    }, [loadPipeline, callbacks]);

    const handleExportJson = useCallback(async () => {
        try {
            const pipeline = buildGraphDocument(nodes, edges);

            // Check if it's empty
            if (!pipeline.graph.outputs || pipeline.graph.outputs.length === 0) {
                alert("No se puede exportar: No se encontraron pasos válidos en el canvas.");
                return;
            }

            const jsonStr = JSON.stringify(pipeline, null, 2);
            await desktopAdapter.saveFile(jsonStr, "graph.json");
        } catch (err: any) {
            console.error("Error al exportar:", err);
            alert(`Error al exportar JSON: ${err.message || err}`);
        }
    }, [nodes, edges]);

    const handleLoadExample = useCallback((exampleId: string, mode: "replace" | "append") => {
        const example = PIPELINE_EXAMPLES.find(ex => ex.id === exampleId);
        if (example) {
            if (mode === "replace") {
                setNodes([]);
                setEdges([]);
            }
            example.add(setNodes, setEdges);
        }
        callbacks.onExampleLoaded?.();
    }, [setNodes, setEdges, callbacks]);

    return {
        fileInputRef,
        loadPipeline,
        handleLoadJson,
        handleFileChange,
        handleExportJson,
        handleLoadExample,
    };
}
