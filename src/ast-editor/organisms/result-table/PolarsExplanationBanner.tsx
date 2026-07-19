import { AlertCircle } from "lucide-react";

interface PolarsExplanationBannerProps {
    isSeriesResult: boolean;
    isMultiOutput: boolean;
    selectedName?: string;
}

/** One-line explainer of what "Polars mode" is showing, shown above the table/series view. */
export function PolarsExplanationBanner({ isSeriesResult, isMultiOutput, selectedName }: PolarsExplanationBannerProps) {
    return (
        <div className={`p-3 ${isSeriesResult ? "bg-purple/10 border-purple/20" : "bg-blue/10 border-blue/20"} border rounded-xl text-xs flex items-start gap-2`}>
            <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isSeriesResult ? "text-violet-400" : "text-blue-400"}`} />
            <p className={`leading-relaxed ${isSeriesResult ? "text-violet-400/80" : "text-blue-400/80"}`}>
                {isSeriesResult
                    ? <>El resultado es una <code className="glass-panel px-1 rounded text-violet-400">pl.Series</code> nativa — no un DataFrame. Se ejecutó <code className="glass-panel px-1 rounded text-violet-400">extract_series_chain</code> sobre el pipeline.</>
                    : isMultiOutput
                        ? <>Esta pestaña muestra la salida <code className="glass-panel px-1 rounded text-blue-400">{selectedName}</code> del grafo — cada salida se materializó con <code className="glass-panel px-1 rounded text-blue-400">Graph.collect()</code>, reutilizando cualquier rama compartida entre ellas.</>
                        : <>El resultado que se muestra es el DataFrame generado por la ejecución del AST de Polars — no SQL. El backend ejecuta <code className="glass-panel px-1 rounded text-blue-400">to_polars()</code> sobre el árbol y devuelve el DataFrame resultante.</>
                }
            </p>
        </div>
    );
}
