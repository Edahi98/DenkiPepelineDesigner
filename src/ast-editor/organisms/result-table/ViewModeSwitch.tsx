import { Database, Code2, BarChart2 } from "lucide-react";
import { PillTabButton } from "../../../shared/atoms/PillTabButton";

export type ViewMode = "polars" | "sql" | "plot";

interface ViewModeSwitchProps {
    viewMode: ViewMode;
    hasPlot: boolean;
    onChange: (mode: ViewMode) => void;
}

/** Polars/SQL/Plot mode toggle — the Plot pill only appears when the selected output has one. */
export function ViewModeSwitch({ viewMode, hasPlot, onChange }: ViewModeSwitchProps) {
    return (
        <div className="flex items-center gap-2 bg-[var(--color-dark-glass)] p-1 rounded-lg border border border-violet-500/50 w-fit">
            <PillTabButton icon={<Database className="w-3.5 h-3.5" />} active={viewMode === "polars"} onClick={() => onChange("polars")}>
                Modo Polars
            </PillTabButton>
            <PillTabButton icon={<Code2 className="w-3.5 h-3.5" />} active={viewMode === "sql"} onClick={() => onChange("sql")}>
                Modo SQL
            </PillTabButton>
            {hasPlot && (
                <PillTabButton icon={<BarChart2 className="w-3.5 h-3.5" />} active={viewMode === "plot"} onClick={() => onChange("plot")}>
                    Modo Gráfico
                </PillTabButton>
            )}
        </div>
    );
}
