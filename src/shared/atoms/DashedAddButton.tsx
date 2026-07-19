import type { ReactNode } from "react";

interface DashedAddButtonProps {
    onClick: () => void;
    children: ReactNode;
}

/**
 * Full-width dashed "+ Add X" button — identical markup was duplicated
 * between ScanForm's "+ Add Column" and RenameForm's "+ Add Mapping".
 */
export function DashedAddButton({ onClick, children }: DashedAddButtonProps) {
    return (
        <button
            onClick={onClick}
            className="w-full py-2 text-xs text-emerald-400 hover:text-emerald-400 border border-dashed border-pink-500/50/50 hover:border-teal/30 rounded-lg transition-colors"
        >
            {children}
        </button>
    );
}
