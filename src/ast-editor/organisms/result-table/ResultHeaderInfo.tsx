import { Table2, Zap } from "lucide-react";
import type { NamedResult } from "./normalize-results";

interface ResultHeaderInfoProps {
    results: NamedResult[];
    selected: NamedResult | null;
    isSeriesResult: boolean;
}

/** Modal header icon, title, shape/dtype badge, and one-line description. */
export function ResultHeaderInfo({ results, selected, isSeriesResult }: ResultHeaderInfoProps) {
    return (
        <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${isSeriesResult ? "bg-purple/10 border border-purple/20" : "bg-teal/10 border border-teal/20"} flex items-center justify-center shrink-0`}>
                {isSeriesResult
                    ? <Zap className="w-5 h-5 text-violet-400" />
                    : <Table2 className="w-5 h-5 text-emerald-400" />
                }
            </div>
            <div>
                <h2 className="text-lg font-bold text-white font-bold drop-shadow-sm leading-tight flex items-center gap-2">
                    {isSeriesResult ? "Resultado: Series" : results.length > 1 ? `Salida: ${selected?.name}` : "Resultado de Ejecución"}
                    {selected && isSeriesResult && (
                        <span className="text-[10px] text-gray-200 font-semibold font-normal glass-panel px-2 py-0.5 rounded-full">
                            {selected.seriesLength} valores · {selected.seriesDtype}
                        </span>
                    )}
                    {selected && !isSeriesResult && selected.columns.length > 0 && (
                        <span className="text-[10px] text-gray-200 font-semibold font-normal glass-panel px-2 py-0.5 rounded-full">
                            {selected.shape[0]} filas × {selected.shape[1]} cols
                        </span>
                    )}
                </h2>
                <p className="text-xs text-gray-200 font-semibold mt-0.5">
                    {isSeriesResult
                        ? `Series "${selected?.name}" de tipo ${selected?.seriesDtype}.`
                        : results.length > 1
                            ? `Grafo con ${results.length} salidas — resultado del pipeline ejecutado.`
                            : "Resultado del pipeline de transformación ejecutado."
                    }
                </p>
            </div>
        </div>
    );
}
