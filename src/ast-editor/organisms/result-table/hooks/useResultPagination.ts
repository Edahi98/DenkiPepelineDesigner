import { useState, useMemo, useEffect } from "react";
import type { NamedResult } from "../normalize-results";

/**
 * Page number plus the two paginated slices (DataFrame rows, Series
 * values) derived from whichever output is currently selected. Resets
 * to page 0 whenever the selected output changes — switching tabs or
 * re-running the pipeline shouldn't leave you stranded on a page that
 * may no longer exist for the new result.
 */
export function useResultPagination(selected: NamedResult | null, isOpen: boolean, pageSize: number) {
    const [page, setPage] = useState(0);

    useEffect(() => {
        if (isOpen) setPage(0);
    }, [isOpen, selected]);

    const { paginatedRows, totalPages, totalRows } = useMemo(() => {
        if (!selected || selected.kind !== "dataframe") return { paginatedRows: [], totalPages: 0, totalRows: 0 };
        const total = selected.rows.length;
        const pages = Math.ceil(total / pageSize);
        const start = page * pageSize;
        return { paginatedRows: selected.rows.slice(start, start + pageSize), totalPages: pages, totalRows: total };
    }, [selected, page, pageSize]);

    const { paginatedValues, seriesTotalPages, seriesTotalValues } = useMemo(() => {
        if (!selected || selected.kind !== "series") return { paginatedValues: [], seriesTotalPages: 0, seriesTotalValues: 0 };
        const total = selected.seriesValues.length;
        const pages = Math.ceil(total / pageSize);
        const start = page * pageSize;
        return { paginatedValues: selected.seriesValues.slice(start, start + pageSize), seriesTotalPages: pages, seriesTotalValues: total };
    }, [selected, page, pageSize]);

    const goToPrevPage = () => setPage(p => Math.max(0, p - 1));
    const goToNextPage = (totalPages: number) => setPage(p => Math.min(totalPages - 1, p + 1));

    return {
        page,
        paginatedRows,
        totalPages,
        totalRows,
        paginatedValues,
        seriesTotalPages,
        seriesTotalValues,
        goToPrevPage,
        goToNextPage,
    };
}
