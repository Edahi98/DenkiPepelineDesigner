
import React from "react";
import { Button } from "../../shared/atoms/Button";
import { Upload, Download, FlaskConical, Trash2, ZoomIn, ZoomOut, Maximize, Library, HelpCircle, FileSearch, Boxes, BoxSelect } from "lucide-react";

interface ToolbarProps {
    onLoadJson: () => void;
    onExportJson: () => void;
    onExecute: () => void;
    onExecuteWithDocument: () => void;
    onClear: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFitView: () => void;
    onOpenHelp: () => void;
    onOpenExamplesLibrary: () => void;
    onGroupSelection: () => void;
    onUngroupSelection: () => void;
    hasSelection: boolean;
    hasGroupSelected: boolean;
    isExecuting: boolean;
}

// Fixed-palette tones. Each already includes its bg/hover/text/border-color/
// shadow — the bare `border` (width+style) and sizing/padding are added by
// ToolbarButton itself so every button shares exactly one source for those.
const TONE_CLASSES = {
    neutral: "bg-white/10 hover:bg-white/20 text-white border-white/10 shadow-sm",
    icon: "bg-white/5 hover:bg-white/10 text-white border-white/5 shadow-sm flex items-center justify-center",
    pink: "bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border-pink-500/30 shadow-sm",
    violet: "bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border-violet-500/30 shadow-sm",
    rose: "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/30 shadow-sm",
    "gradient-emerald": "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold border-none shadow-md hover:shadow-lg transition-all",
    "gradient-blue": "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 border-none transition-all duration-300",
} as const;

// Two-state tones (Agrupar/Desagrupar): a named active color, or the shared
// dim "nothing to act on yet" look when inactive.
const TOGGLE_TONE_CLASSES: Record<"fuchsia" | "orange", string> = {
    fuchsia: "bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-200 border-fuchsia-500/30",
    orange: "bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border-orange-500/30",
};
const TOGGLE_INACTIVE_CLASSES = "bg-white/5 text-white/30 border-white/5";

type FixedTone = keyof typeof TONE_CLASSES;
type ToolbarButtonTone = FixedTone | { toggle: "fuchsia" | "orange"; active: boolean };

/**
 * Every toolbar button was hand-rolling the same `min-w-0 h-9 rounded-lg
 * border ...` shell plus a manual `<div className="flex items-center
 * gap-1.5">` around its icon+label — redundant on top of `Button`, which
 * already wraps its children in that exact div. This is the one place
 * that shell is assembled; each button below only names its color.
 */
function ToolbarButton({
    icon,
    children,
    tone,
    onPress,
    disabled,
}: {
    icon: React.ReactNode;
    children?: React.ReactNode;
    tone: ToolbarButtonTone;
    onPress: () => void;
    disabled?: boolean;
}) {
    const isGradient = typeof tone === "string" && tone.startsWith("gradient-");
    const isIcon = tone === "icon";
    const toneClasses = typeof tone === "string"
        ? TONE_CLASSES[tone]
        : tone.active ? TOGGLE_TONE_CLASSES[tone.toggle] : TOGGLE_INACTIVE_CLASSES;
    const border = isGradient ? "" : "border";
    const transition = typeof tone === "object" ? "transition-all" : "";
    const padding = isIcon ? "px-2" : isGradient ? "px-4" : "px-3";

    return (
        <Button
            className={`${toneClasses} ${border} ${transition} min-w-0 ${padding} h-9 rounded-lg`}
            isDisabled={disabled}
            onPress={onPress}
        >
            {icon}
            {children && <span>{children}</span>}
        </Button>
    );
}

export const Toolbar = ({
    onLoadJson,
    onExportJson,
    onExecute,
    onExecuteWithDocument,
    onClear,
    onZoomIn,
    onZoomOut,
    onFitView,
    onOpenHelp,
    onOpenExamplesLibrary,
    onGroupSelection,
    onUngroupSelection,
    hasSelection,
    hasGroupSelected,
    isExecuting,
}: ToolbarProps) => {

    return (
        <div className="flex items-center gap-2 px-4 py-3 glass-panel rounded-none rounded-t-2xl flex-wrap border-b border-white/10 z-10">

            <div className="flex items-center gap-2">
                <ToolbarButton icon={<Upload className="w-4 h-4" />} tone="neutral" onPress={onLoadJson}>
                    Cargar
                </ToolbarButton>
                <ToolbarButton icon={<Download className="w-4 h-4" />} tone="neutral" onPress={onExportJson}>
                    Exportar
                </ToolbarButton>
            </div>

            <div className="w-px h-6 bg-white/10 mx-2" />

            {/* Grouping Actions */}
            <div className="flex items-center gap-2">
                <ToolbarButton
                    icon={<BoxSelect className="w-4 h-4" />}
                    tone={{ toggle: "fuchsia", active: hasSelection }}
                    disabled={!hasSelection}
                    onPress={onGroupSelection}
                >
                    Agrupar
                </ToolbarButton>
                <ToolbarButton
                    icon={<Boxes className="w-4 h-4" />}
                    tone={{ toggle: "orange", active: hasGroupSelected }}
                    disabled={!hasGroupSelected}
                    onPress={onUngroupSelection}
                >
                    Desagrupar
                </ToolbarButton>
            </div>

            <div className="w-px h-6 bg-white/10 mx-2" />

            <div className="flex items-center gap-2">
                <ToolbarButton
                    icon={<FlaskConical className="w-4 h-4" />}
                    tone="gradient-emerald"
                    disabled={isExecuting}
                    onPress={onExecute}
                >
                    {isExecuting ? "Probando..." : "Probar"}
                </ToolbarButton>
                <ToolbarButton
                    icon={<FileSearch className="w-4 h-4" />}
                    tone="gradient-blue"
                    disabled={isExecuting}
                    onPress={onExecuteWithDocument}
                >
                    Probar con Documento
                </ToolbarButton>
            </div>

            <div className="w-px h-6 bg-white/10 mx-2" />

            <div className="flex items-center gap-1">
                <ToolbarButton icon={<ZoomIn className="w-4 h-4" />} tone="icon" onPress={onZoomIn} />
                <ToolbarButton icon={<ZoomOut className="w-4 h-4" />} tone="icon" onPress={onZoomOut} />
                <ToolbarButton icon={<Maximize className="w-4 h-4" />} tone="icon" onPress={onFitView} />
            </div>

            <div className="w-px h-6 bg-white/10 mx-2" />

            <ToolbarButton icon={<Library className="w-4 h-4" />} tone="pink" onPress={onOpenExamplesLibrary}>
                Ejemplos
            </ToolbarButton>

            <ToolbarButton icon={<HelpCircle className="w-4 h-4" />} tone="violet" onPress={onOpenHelp}>
                Ayuda
            </ToolbarButton>

            <div className="flex-1" />

            <ToolbarButton icon={<Trash2 className="w-4 h-4" />} tone="rose" onPress={onClear}>
                Limpiar
            </ToolbarButton>
        </div>
    );
};
