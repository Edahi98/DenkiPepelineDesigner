import { Button } from "../../shared/atoms/Button";
import { X, Info, AlertTriangle } from "lucide-react";
import type { Node, Edge } from "reactflow";
import type { AstNodeData } from "../../shared/types/ast_types";
import { NodeHeader } from "../molecules/NodeHeader";
import { getNodeMetadata, nodeSupportsSql } from "../../shared/utils/node_metadata";
import { NODE_FORM_SCHEMAS } from "./node-form/node-form-schemas";
import { renderFieldSpecs, type FormContext } from "./node-form/field-spec";
import { useNodeFormState } from "./hooks/useNodeFormState";

interface NodePanelProps {
    isOpen: boolean;
    node: Node<AstNodeData> | null;
    onClose: () => void;
    onChange: (nodeId: string, updatedProperties: Record<string, any>, newType?: string) => void;
    /**
     * Optional full canvas context.  Needed by node types whose panel
     * depends on graph topology (e.g. the chain node counts its
     * connected child expressions).  Defaults to undefined for
     * backward compatibility with existing call sites.
     */
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

    if (!node || !isOpen) return null;

    const renderFormFields = () => {
        const type = node.data.nodeType;
        const entry = NODE_FORM_SCHEMAS[type];

        if (!entry) {
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

        return typeof entry === "function" ? entry(ctx) : renderFieldSpecs(entry, ctx);
    };

    const stopPropagation = (e: React.SyntheticEvent | React.KeyboardEvent | React.MouseEvent) => {
        e.stopPropagation();
    };

    const meta = getNodeMetadata(node.data.nodeType, editValues);

    return (
        <div
            onKeyDown={stopPropagation}
            onKeyUp={stopPropagation}
            onKeyPress={stopPropagation}
            onMouseDown={stopPropagation}
            onMouseUp={stopPropagation}
            onClick={stopPropagation}
            onContextMenu={stopPropagation}
            className="fixed top-24 right-6 bottom-6 w-[380px] glass-panel/95 backdrop-blur-xl border border-2 border-blue-500/50 rounded-2xl z-[1000] flex flex-col shadow-2xl overflow-hidden"
        >
            <div className="flex items-center gap-2 border-b border-2 border-blue-500/50 p-4">
                <div className="flex-1">
                    <NodeHeader
                        label={node.data.label}
                        nodeType={node.data.nodeType}
                        isExpression={node.data.isExpression}
                    />
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg glass-panel hover:glass-panel text-gray-200 font-semibold hover:text-white font-bold drop-shadow-sm transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 flex flex-col gap-5 p-5 overflow-y-auto">
                {/* Node Description Box */}
                <div className="p-3.5 bg-teal/5 border border-teal/20 rounded-xl flex gap-2.5 text-white font-bold drop-shadow-sm text-xs shadow-[0_0_15px_rgba(34,154,164,0.02)]">
                    <Info className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                        <p className="font-semibold text-white font-bold drop-shadow-sm">¿Para qué sirve?</p>
                        <p className="leading-relaxed text-white font-bold drop-shadow-sm">{meta.description}</p>
                        <p className="text-gray-200 font-semibold mt-1 leading-relaxed">
                            <strong className="text-white font-bold drop-shadow-sm">Uso típico:</strong> {meta.typicalUse}
                        </p>
                    </div>
                </div>

                {/* SQL Compatibility Warning */}
                {!nodeSupportsSql(node.data.nodeType, editValues) && (
                    <div className="p-3.5 bg-brown/5 border border-brown/20 rounded-xl flex gap-2.5 text-white font-bold drop-shadow-sm text-xs shadow-[0_0_15px_rgba(86,36,7,0.02)] animate-pulse">
                        <AlertTriangle className="w-4.5 h-4.5 text-brown shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1">
                            <p className="font-semibold text-brown">Compatibilidad SQL</p>
                            <p className="leading-relaxed text-white font-bold drop-shadow-sm">Este nodo no es compatible con la exportación SQL.</p>
                        </div>
                    </div>
                )}

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
