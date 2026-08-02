import { useState, useRef, useCallback } from "react";
import { Button } from "../../shared/atoms/Button";
import { X, Info, AlertTriangle, ChevronDown } from "lucide-react";
import type { Node, Edge } from "reactflow";
import type { AstNodeData } from "../../shared/types/ast_types";
import { NodeHeader } from "../molecules/NodeHeader";
import { getNodeMetadata, nodeSupportsSql } from "../../shared/utils/node_metadata";
import { NODE_FORM_SCHEMAS } from "./node-form/node-form-schemas";
import { renderFieldSpecs, inferFieldSpecs, type FormContext } from "./node-form/field-spec";
import { useNodeFormState } from "./hooks/useNodeFormState";

const MIN_WIDTH = 280;
const MAX_WIDTH = 900;
const DEFAULT_WIDTH = 380;

interface NodePanelProps {
    isOpen: boolean;
    node: Node<AstNodeData> | null;
    onClose: () => void;
    onChange: (nodeId: string, updatedProperties: Record<string, any>, newType?: string) => void;
    allNodes?: Node<AstNodeData>[];
    allEdges?: Edge[];
}

export const NodePanel = ({
    isOpen,
    node,
    onClose,
    onChange,
    allNodes,
    allEdges,
}: NodePanelProps) => {
    const { editValues, availableColumns, columnOptions, handleFieldChange } = useNodeFormState(node, onChange);
    const [width, setWidth] = useState(DEFAULT_WIDTH);
    const [infoExpanded, setInfoExpanded] = useState(false);
    const dragStartX = useRef<number | null>(null);
    const dragStartWidth = useRef<number>(DEFAULT_WIDTH);

    const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragStartX.current = e.clientX;
        dragStartWidth.current = width;

        const onMouseMove = (ev: MouseEvent) => {
            if (dragStartX.current === null) return;
            const delta = dragStartX.current - ev.clientX;
            const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStartWidth.current + delta));
            setWidth(next);
        };

        const onMouseUp = () => {
            dragStartX.current = null;
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }, [width]);

    if (!node || !isOpen) return null;

    const renderFormFields = () => {
        const type = node.data.nodeType;
        const entry = NODE_FORM_SCHEMAS[type];

        // No hand-written schema: derive the fields from the node's own
        // properties rather than claiming it has none. Only a node that
        // genuinely carries no properties gets the empty-state message.
        const inferred = entry ? null : inferFieldSpecs(node.data.properties ?? {});
        if (inferred && inferred.length === 0) {
            return (
                <div className="text-gray-200 font-semibold italic text-sm text-center py-4">
                    Este tipo de nodo ({type}) no requiere propiedades o es controlado visualmente por conexiones.
                </div>
            );
        }

        const ctx: FormContext = {
            type,
            node,
            editValues,
            handleFieldChange,
            availableColumns,
            columnOptions,
            allNodes,
            allEdges,
        };

        if (inferred) return renderFieldSpecs(inferred, ctx);
        return typeof entry === "function" ? entry(ctx) : renderFieldSpecs(entry, ctx);
    };

    const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

    const meta = getNodeMetadata(node.data.nodeType, editValues);
    const sqlUnsupported = !nodeSupportsSql(node.data.nodeType, editValues);

    return (
        <div
            onKeyDown={stopPropagation}
            onKeyUp={stopPropagation}
            onKeyPress={stopPropagation}
            onMouseDown={stopPropagation}
            onMouseUp={stopPropagation}
            onClick={stopPropagation}
            onContextMenu={stopPropagation}
            style={{ width }}
            className="fixed top-24 right-6 bottom-6 glass-panel/95 backdrop-blur-xl border border-2 border-blue-500/50 rounded-2xl z-[1000] flex flex-col shadow-2xl overflow-hidden"
        >
            {/* Resize handle */}
            <div
                onMouseDown={onResizeMouseDown}
                className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize z-10 hover:bg-blue-500/40 transition-colors rounded-l-2xl"
            />

            {/* Header */}
            <div className="flex items-center gap-2 border-b border-2 border-blue-500/50 p-4">
                <div className="flex-1">
                    <NodeHeader
                        label={node.data.label}
                        nodeType={node.data.nodeType}
                        isExpression={node.data.isExpression}
                    />
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); setInfoExpanded(v => !v); }}
                    className={`p-1.5 rounded-lg transition-colors ${infoExpanded ? "bg-emerald-500/20 text-emerald-400" : "glass-panel text-gray-400 hover:text-emerald-400"}`}
                    title="¿Para qué sirve?"
                >
                    <Info size={16} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="p-1.5 rounded-lg glass-panel text-gray-200 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Collapsible info panel — right below header, not in the scroll area */}
            {infoExpanded && (
                <div className="border-b border-blue-500/30 bg-teal/5 px-4 py-3 flex flex-col gap-2 text-xs">
                    <p className="leading-relaxed text-white font-bold drop-shadow-sm">{meta.description}</p>
                    <p className="text-gray-200 font-semibold leading-relaxed">
                        <strong className="text-white drop-shadow-sm">Uso típico:</strong> {meta.typicalUse}
                    </p>
                    {sqlUnsupported && (
                        <div className="flex items-center gap-1.5 text-amber-400 mt-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>No compatible con exportación SQL.</span>
                        </div>
                    )}
                </div>
            )}

            {/* Scrollable form area */}
            <div className="flex-1 flex flex-col gap-5 p-5 overflow-y-auto">
                {renderFormFields()}
            </div>

            <div className="border-t border-2 border-blue-500/50 p-4">
                <Button
                    className="glass-panel text-white font-bold drop-shadow-sm border border-pink-500/50 hover:bg-[var(--color-dark-glass)] w-full rounded-xl py-2.5 transition-all"
                    onPress={onClose}
                >
                    <X className="w-4 h-4 mr-1" />
                    Close
                </Button>
            </div>
        </div>
    );
};
