import { useCallback } from "react";
import { desktopAdapter } from "../adapters/desktop-adapter";

/**
 * Opens the native "select a file" dialog restricted to `extensions`
 * and, if the user picked one, calls `onSelected` with the chosen path.
 * Was duplicated as a local `handleBrowse` in FileReaderForm (and, in
 * spirit, in ScanForm/IsInForm's `useDatasetPathFetch`) —
 * one hook for "browse for a file, then do something with its path".
 */
export function useFileBrowse(extensions: readonly string[], onSelected: (path: string) => void) {
    const browse = useCallback(async () => {
        try {
            const result = await desktopAdapter.selectFile(Array.from(extensions));
            if (typeof result === "string" && result.length > 0) {
                onSelected(result);
            }
        } catch (err) {
            console.error("Browse Error:", err);
        }
    }, [extensions, onSelected]);

    return browse;
}
