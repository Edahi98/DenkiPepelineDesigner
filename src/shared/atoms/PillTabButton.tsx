import type { ReactNode } from "react";

export type PillTabTone = "emerald" | "blue";

const ACTIVE_CLASSES: Record<PillTabTone, string> = {
    emerald: "glass-panel text-white font-bold drop-shadow-sm shadow-sm border border-2 border-emerald-500/50",
    blue: "glass-panel text-white font-bold drop-shadow-sm shadow-sm border border-2 border-blue-500/50",
};
const INACTIVE_CLASSES = "text-gray-200 font-semibold hover:text-white font-bold drop-shadow-sm hover:bg-gray/5 border border-transparent";

interface PillTabButtonProps {
    icon: ReactNode;
    active: boolean;
    tone?: PillTabTone;
    onClick: () => void;
    children: ReactNode;
}

/**
 * Small pill-shaped tab/toggle button (icon + label, active/inactive
 * look). ResultTable used this exact shape twice — the multi-output tab
 * bar and the Polars/SQL/Plot mode switch — with copy-pasted classes
 * that had already drifted slightly (the mode switch's inactive state
 * was missing `border border-transparent`, so toggling it shifted
 * layout by the active state's border width). One implementation now.
 */
export function PillTabButton({ icon, active, tone = "blue", onClick, children }: PillTabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${active ? ACTIVE_CLASSES[tone] : INACTIVE_CLASSES}`}
        >
            {icon}
            {children}
        </button>
    );
}
