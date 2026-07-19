import type { ExecutionResult, DataframeResult, SeriesResult } from "../../../shared/types/ast_types";

/**
 * One selectable output tab. Tsubasa's `/execute` returns either a
 * single legacy `{"dataframe"|"series": ...}` result, or — for a
 * `{"graph": ...}` document — an `{"outputs": {name: {...}}}` map with
 * one entry per named sink. Both are normalized to the same shape here
 * so the rest of ResultTable only ever renders "the current tab",
 * whether there's one of them or several.
 */
export interface NamedResult {
    name: string;
    kind: "dataframe" | "series";
    columns: string[];
    rows: Record<string, any>[];
    shape: [number, number];
    seriesValues: any[];
    seriesDtype: string;
    seriesLength: number;
    plot?: string;
}

/** A graph output shaped like a Series (`values`/`dtype`), not a DataFrame
 * (`columns`/`shape`) — the two never overlap, so the value's own shape
 * is enough to tell them apart without a separate discriminator field. */
function isSeriesOutput(out: DataframeResult | SeriesResult): out is SeriesResult {
    return "values" in out;
}

export function normalizeResults(result: ExecutionResult | null): NamedResult[] {
    if (!result) return [];

    if (result.outputs && Object.keys(result.outputs).length > 0) {
        return Object.entries(result.outputs).map(([name, out]) => {
            if (isSeriesOutput(out)) {
                return {
                    name: out.name || name,
                    kind: "series" as const,
                    columns: [],
                    rows: [],
                    shape: [0, 0] as [number, number],
                    seriesValues: out.values ?? [],
                    seriesDtype: out.dtype ?? "",
                    seriesLength: out.length ?? 0,
                };
            }
            return {
                name,
                kind: "dataframe" as const,
                columns: out.columns ?? [],
                rows: out.data ?? [],
                shape: out.shape ?? [0, 0] as [number, number],
                seriesValues: [],
                seriesDtype: "",
                seriesLength: 0,
                plot: out.plot,
            };
        });
    }

    if (result.dataframe) {
        return [{
            name: "resultado",
            kind: "dataframe",
            columns: result.dataframe.columns ?? [],
            rows: result.dataframe.data ?? [],
            shape: result.dataframe.shape ?? [0, 0],
            seriesValues: [],
            seriesDtype: "",
            seriesLength: 0,
            // `plot` used to live at the top level of ExecutionResult; the
            // backend now nests it under `dataframe`/`outputs[name]` so a
            // multi-output result never has an ambiguous single plot — the
            // top-level field is kept only as a fallback for older responses.
            plot: result.dataframe.plot ?? result.plot,
        }];
    }

    if (result.series) {
        return [{
            name: result.series.name || "resultado",
            kind: "series",
            columns: [],
            rows: [],
            shape: [0, 0],
            seriesValues: result.series.values ?? [],
            seriesDtype: result.series.dtype ?? "",
            seriesLength: result.series.length ?? 0,
        }];
    }

    return [];
}
