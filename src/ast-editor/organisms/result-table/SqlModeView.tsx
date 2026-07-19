import { AlertCircle } from "lucide-react";

interface SqlModeViewProps {
    astTree?: string | null;
    sql?: string | null;
    sqlError?: string | null;
}

/**
 * SQL mode content — global, not per-output: Tsubasa doesn't compute a
 * separate AST/SQL per graph sink today.
 */
export function SqlModeView({ astTree, sql, sqlError }: SqlModeViewProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4">
                {astTree && (
                    <div className="flex-1">
                        <h4 className="text-[10px] font-bold text-gray-200 font-semibold uppercase tracking-wider mb-1.5">AST Tree</h4>
                        <pre className="text-xs font-mono text-violet-400 bg-purple/10 border border-purple/20 p-3 rounded-xl overflow-auto h-32">
                            {astTree}
                        </pre>
                    </div>
                )}

                {sql && (
                    <div className="flex-1">
                        <h4 className="text-[10px] font-bold text-gray-200 font-semibold uppercase tracking-wider mb-1.5">SQL Generado</h4>
                        <pre className="text-xs font-mono text-blue-400 bg-blue/10 border border-blue/20 p-3 rounded-xl overflow-auto h-32">
                            {sql}
                        </pre>
                    </div>
                )}
            </div>

            {sqlError && (
                <div>
                    <h4 className="text-[10px] font-bold text-[#ff0000] uppercase tracking-wider mb-1.5">SQL Compilation Error</h4>
                    <pre className="text-xs font-mono text-[#ff0000] bg-red/15 border border-red/30 p-3 rounded-xl overflow-auto max-h-28 whitespace-pre-wrap">
                        {sqlError}
                    </pre>
                </div>
            )}

            {!sqlError && sql && (
                <div className="p-3 bg-teal/10 border border-teal/20 rounded-xl text-emerald-400/80 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <p className="leading-relaxed">
                        Compilación SQL exitosa. No se reportaron errores en el parseo del AST a la sintaxis SQL requerida.
                    </p>
                </div>
            )}
        </div>
    );
}
