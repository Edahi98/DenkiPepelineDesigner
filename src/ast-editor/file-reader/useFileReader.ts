"use client";

import { useCallback, useMemo, useState } from "react";

import { columnStore } from "../../shared/utils/column_store";
import { desktopAdapter } from "../../shared/adapters/desktop-adapter";

import {
    FILE_READER_COLUMN_NAME,
    FILE_READER_EXTENSIONS,
} from "./constants";

export interface FileReaderState {
    path: string;
    data: Record<string, unknown>;
    error: string | null;
    isLoading: boolean;
    loaded: boolean;
}

const initialState: FileReaderState = {
    path: "",
    data: {},
    error: null,
    isLoading: false,
    loaded: false,
};

export interface UseFileReader {
    state: FileReaderState;
    ext: string | null;
    setPath: (path: string) => void;
    loadFile: () => Promise<{ column: string; values: string[] } | null>;
    reset: () => void;
}

export function useFileReader(): UseFileReader {
    const [state, setState] = useState<FileReaderState>(initialState);

    const ext = useMemo<string | null>(() => {
        if (!state.path) return null;
        const e = state.path.toLowerCase().split(".").pop() || "";
        return FILE_READER_EXTENSIONS.includes(e as any) ? e : null;
    }, [state.path]);

    const setPath = useCallback((path: string) => {
        setState((prev) => ({
            ...prev,
            path,
            loaded: false,
            error: null,
        }));
    }, []);

    const reset = useCallback(() => {
        setState(initialState);
        columnStore.clear();
    }, []);

    const loadFile = useCallback(async () => {
        if (!state.path || !ext) {
            setState((prev) => ({
                ...prev,
                error: "Selecciona primero un archivo válido.",
            }));
            return null;
        }
        
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const values = await desktopAdapter.processDocument(state.path);
            const data = { [FILE_READER_COLUMN_NAME]: values };
            setState((prev) => ({
                ...prev,
                data,
                isLoading: false,
                loaded: true,
            }));
            columnStore.setColumns([FILE_READER_COLUMN_NAME]);
            return { column: FILE_READER_COLUMN_NAME, values };
        } catch (e: any) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: e?.message || String(e),
            }));
            return null;
        }
    }, [state.path, ext]);

    return { state, ext, setPath, loadFile, reset };
}
