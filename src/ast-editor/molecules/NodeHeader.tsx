
import React from "react";
import { Settings } from "lucide-react";

interface NodeHeaderProps {
    label: string;
    nodeType: string;
    isExpression: boolean;
}

export const NodeHeader = ({ label, nodeType, isExpression }: NodeHeaderProps) => {
    return (
        <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <Settings className="w-4 h-4 text-orange-400" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-white leading-tight truncate">
                    {label}
                </h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">
                    {nodeType} • {isExpression ? "Expression" : "DataFrame Op"}
                </p>
            </div>
        </div>
    );
};
