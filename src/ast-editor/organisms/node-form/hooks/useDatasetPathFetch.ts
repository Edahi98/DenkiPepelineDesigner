import { useState, useCallback } from "react";
import { desktopAdapter } from "../../../../shared/adapters/desktop-adapter";

/**
 * Shared "browse for a CSV/Parquet file, then run an async lookup
 * against the chosen path" pattern used by `ScanForm` (fetches a data
 * preview) and `IsInForm` (fetches column names) — same file dialog,
 * same isLoading/error bookkeeping, only the lookup differs per caller.
 */
export function useDatasetPathFetch<T>(
    fetchForPath: (path: string) => Promise<T>,
    onSuccess: (result: T) => void,
    onError?: () => void,
    fallbackErrorMessage = "Failed to load dataset",
) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runFetch = useCallback(async (path: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchForPath(path);
            onSuccess(result);
        } catch (err: any) {
            console.error(err);
            setError(err.message || fallbackErrorMessage);
            onError?.();
        } finally {
            setIsLoading(false);
        }
    }, [fetchForPath, onSuccess, onError, fallbackErrorMessage]);

    const browseForFile = useCallback(async (): Promise<string | null> => {
        const result = await desktopAdapter.selectFile(['csv', 'parquet']);
        return typeof result === "string" && result.length > 0 ? result : null;
    }, []);

    return { isLoading, error, runFetch, browseForFile };
}
