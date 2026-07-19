
import React from "react";
import { Link2 } from "lucide-react";

import { SelectField } from "./PropertyField";
import type { ChainOp } from "../../shared/utils/ast_wrappers";

interface ChainFormProps {
    op: ChainOp;
    operandCount: number;
    onOpChange: (op: ChainOp) => void;
}

/**
 * Form panel for a Chain node.
 *
 * Single Responsibility: only renders the configuration form for a
 * chain (operator + operand count summary).  Does NOT touch the
 * AST or any state outside its own props.
 *
 * The operand list itself is shown on the canvas as connected
 * child nodes; the count is derived dynamically by NodePanel.
 */
export const ChainForm = ({ op, operandCount, onOpChange }: ChainFormProps) => {
    const operandNoun = operandCount === 1 ? "operando" : "operandos";

    return (
        <div className="flex flex-col gap-4 mb-4 p-5 border border-pink/30 bg-pink/10 rounded-xl shadow-[0_0_15px_rgba(233,141,191,0.1)]">
            <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-pink-400" />
                <span className="text-xs text-gray-200 font-semibold font-semibold uppercase tracking-wide">
                    Chain Configuration
                </span>
            </div>

            <SelectField
                label="Operador"
                value={op}
                options={[
                    { value: "|", label: "| (OR)" },
                    { value: "&", label: "& (AND)" },
                ]}
                onChange={(val) => onOpChange(val === "&" ? "&" : "|")}
            />

            <div className="flex flex-col gap-1 px-3 py-2 bg-[var(--color-dark-glass)] border border-dark rounded-lg">
                <span className="text-[10px] text-gray-200 font-semibold uppercase tracking-wide font-semibold">
                    Operandos
                </span>
                <span className="text-sm text-white font-bold drop-shadow-sm font-mono">
                    {operandCount} {operandNoun} conectado{operandCount === 1 ? "" : "s"}
                </span>
                <p className="text-[10px] text-gray-200 font-semibold leading-snug mt-1">
                    Conecta 2 o más nodos de expresión (columnas, literales, llamadas) a este Chain
                    desde el canvas. Se combinarán con el operador seleccionado al serializar.
                </p>
            </div>
        </div>
    );
};
