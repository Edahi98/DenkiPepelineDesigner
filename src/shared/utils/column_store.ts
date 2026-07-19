import { eventBus } from "./event_bus";

/**
 * Global store for available columns in the active dataset.
 * Columns are extracted from Scan nodes' data or from execution results.
 * Nodes that reference columns (Col, group_by, sort, drop, etc.) subscribe
 * to changes and offer dynamic column selection.
 */
class ColumnStore {
    private _columns: string[] = [];

    get columns(): string[] {
        return this._columns;
    }

    /** Replace the current columns and notify all listeners */
    setColumns(columns: string[]) {
        this._columns = Array.from(new Set(columns)).sort();
        if (!this._columns.includes("<extr_column>")) {
            this._columns.unshift("<extr_column>");
        }
        eventBus.notify("COLUMNS_CHANGED", this._columns);
    }

    /** Extract columns from a Scan node's inline data object */
    extractFromScanData(data: Record<string, any>) {
        if (data && typeof data === "object" && !Array.isArray(data)) {
            const keys = Object.keys(data);
            if (keys.length > 0) {
                this.setColumns(keys);
            }
        }
    }

    /** Extract columns from an execution result (single dataframe, or one
     * per named output — a Series-typed output has no `columns` at all
     * and is simply skipped here, same as if it were absent). */
    extractFromExecutionResult(result: { dataframe?: { columns?: string[] }; outputs?: Record<string, { columns?: string[]; values?: unknown[] }> }) {
        const cols = new Set<string>();
        for (const c of result?.dataframe?.columns ?? []) cols.add(c);
        for (const out of Object.values(result?.outputs ?? {})) {
            for (const c of out?.columns ?? []) cols.add(c);
        }
        if (cols.size > 0) {
            this.setColumns(Array.from(cols));
        }
    }

    /** Extract columns from all scan nodes currently on the canvas */
    extractFromNodes(nodes: Array<{ data: { nodeType: string; properties: Record<string, any> } }>) {
        const allCols: string[] = [];
        for (const node of nodes) {
            if (node.data.nodeType === "scan") {
                const d = node.data.properties.data;
                if (d && typeof d === "object" && !Array.isArray(d)) {
                    allCols.push(...Object.keys(d));
                }
            }
        }
        if (allCols.length > 0) {
            this.setColumns(allCols);
        }
    }

    /** Clear all columns */
    clear() {
        this._columns = [];
        eventBus.notify("COLUMNS_CHANGED", this._columns);
    }
}

export const columnStore = new ColumnStore();
