import type { ReactNode } from "react";

interface ActionButtonProps {
    icon: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    tone?: "blue" | "teal";
    className?: string;
    children: ReactNode;
}

const TONE_CLASSES: Record<"blue" | "teal", string> = {
    blue: "border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400",
    teal: "border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400",
};

/**
 * Full-width bordered action button (icon + label) — the "browse for a
 * file" / "switch mode" shape that was copy-pasted across ScanForm,
 * IsInForm, and FileReaderForm, each with slightly drifted
 * Tailwind classes (font-semibold vs font-bold, hover:bg vs hover:text,
 * border-blue vs border-blue-500). This is the single, converged style.
 */
export function ActionButton({ icon, onClick, disabled, tone = "blue", className = "", children }: ActionButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border shadow-md transition-colors text-sm font-bold hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${TONE_CLASSES[tone]} ${className}`}
        >
            {icon}
            {children}
        </button>
    );
}
