import { useState, useMemo, useEffect } from "react";
import type { ExecutionResult } from "../../../../shared/types/ast_types";
import { normalizeResults, type NamedResult } from "../normalize-results";
import type { ViewMode } from "../ViewModeSwitch";

/**
 * Which output tab is selected and which view mode (Polars/SQL/Plot) is
 * showing, plus the normalized result list they're both derived from.
 * Resets to the first tab whenever a new execution result comes in, and
 * lands on the Plot view when the newly-selected tab has one.
 */
export function useResultViewState(result: ExecutionResult | null, isOpen: boolean) {
    const [viewMode, setViewMode] = useState<ViewMode>("polars");
    const [selectedIndex, setSelectedIndex] = useState(0);

    const results = useMemo(() => normalizeResults(result), [result]);
    const selected: NamedResult | null = results[selectedIndex] ?? results[0] ?? null;
    const isSeriesResult = selected?.kind === "series";

    // Reset to the first tab whenever a new result comes in.
    useEffect(() => {
        if (isOpen) setSelectedIndex(0);
    }, [isOpen, result]);

    // Land on the plot view when the *selected* tab has one; otherwise polars.
    useEffect(() => {
        if (isOpen) {
            setViewMode(selected?.plot ? "plot" : "polars");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, selectedIndex, result]);

    return {
        results,
        selected,
        isSeriesResult,
        viewMode,
        setViewMode,
        selectedIndex,
        setSelectedIndex,
    };
}
