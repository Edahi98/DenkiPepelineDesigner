import { useState } from "react";
import { Database, FolderSearch, FileText } from "lucide-react";
import { TextField, SelectField, ListField, SwitchField } from "../../molecules/PropertyField";
import { ActionButton } from "../../../shared/atoms/ActionButton";
import { IconDeleteButton } from "../../../shared/atoms/IconDeleteButton";
import { DashedAddButton } from "../../../shared/atoms/DashedAddButton";
import { desktopAdapter } from "../../../shared/adapters/desktop-adapter";
import { useDatasetPathFetch } from "./hooks/useDatasetPathFetch";
import { COMMON_CALL_METHODS, CALL_PATTERN_FIELDS } from "./data/call-form-data";

// ──────────────────────────────────────────────────────────────────
// Sub-forms for complex node types (no raw JSON)
// ──────────────────────────────────────────────────────────────────


/** IsIn node: inline value list + file loader that populates values */
export function IsInForm({
    editValues,
    onFieldChange,
}: {
    editValues: Record<string, any>;
    onFieldChange: (key: string, value: any) => void;
}) {
    const [localPath, setLocalPath] = useState<string>("");
    const [columns, setColumns] = useState<string[]>([]);
    const [selectedColumn, setSelectedColumn] = useState<string>("");
    const [isLoadingColumns, setIsLoadingColumns] = useState(false);
    const [isLoadingValues, setIsLoadingValues] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBrowse = async () => {
        const path = await desktopAdapter.selectFile(['csv', 'parquet']);
        if (!path) return;
        setLocalPath(path);
        setColumns([]);
        setSelectedColumn("");
        setError(null);
        setIsLoadingColumns(true);
        try {
            const cols = await desktopAdapter.getDatasetColumns(path);
            setColumns(cols);
        } catch (e: any) {
            setError(e.message || "Failed to load columns");
        } finally {
            setIsLoadingColumns(false);
        }
    };

    const handleColumnSelect = async (column: string) => {
        setSelectedColumn(column);
        if (!column || !localPath) return;
        setError(null);
        setIsLoadingValues(true);
        try {
            const vals = await desktopAdapter.getDatasetColumnValues(localPath, column);
            onFieldChange("values", JSON.stringify(vals));
        } catch (e: any) {
            setError(e.message || "Failed to load values");
        } finally {
            setIsLoadingValues(false);
        }
    };

    return (
        <div className="space-y-4">
            <ListField
                label="Values"
                value={editValues.values || "[]"}
                onChange={(v) => onFieldChange("values", v)}
                placeholder="Enter a value..."
            />

            <div className="border-t border-white/10 pt-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Load from file
                </div>
                <div className="flex flex-col gap-2">
                    <ActionButton
                        icon={<FolderSearch className="w-4 h-4" />}
                        onClick={handleBrowse}
                        disabled={isLoadingColumns}
                        tone="blue"
                    >
                        {isLoadingColumns ? "Loading columns..." : "Browse Dataset File..."}
                    </ActionButton>

                    {localPath && (
                        <div className="font-mono text-[10px] text-blue-300 bg-blue-500/10 border border-blue-500/30 p-2.5 rounded-lg break-all">
                            <strong className="text-pink-400 mr-2 uppercase tracking-wide text-xs">File:</strong>
                            {localPath.split(/[\\/]/).pop()}
                        </div>
                    )}

                    {error && (
                        <div className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded">
                            {error}
                        </div>
                    )}

                    {columns.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-white drop-shadow-sm flex items-center gap-2">
                                Column
                                {isLoadingValues && <span className="text-emerald-400 animate-pulse text-[10px]">(Loading values...)</span>}
                            </label>
                            <select
                                value={selectedColumn}
                                onChange={(e) => handleColumnSelect(e.target.value)}
                                className="w-full glass-panel border border-pink-500/50 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold drop-shadow-sm focus:outline-none focus:border-emerald-500/50"
                                disabled={isLoadingValues}
                            >
                                <option value="">-- Select Column --</option>
                                {columns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <SwitchField
                label="Nulls Equal"
                isSelected={!!editValues.nulls_equal}
                onChange={(v) => onFieldChange("nulls_equal", v)}
            />
        </div>
    );
}

/** ContainsAny node: inline pattern list + file loader */
export function ContainsAnyForm({
    editValues,
    onFieldChange,
}: {
    editValues: Record<string, any>;
    onFieldChange: (key: string, value: any) => void;
}) {
    const [localPath, setLocalPath] = useState<string>("");
    const [columns, setColumns] = useState<string[]>([]);
    const [selectedColumn, setSelectedColumn] = useState<string>("");
    const [isLoadingColumns, setIsLoadingColumns] = useState(false);
    const [isLoadingValues, setIsLoadingValues] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBrowse = async () => {
        const path = await desktopAdapter.selectFile(['csv', 'parquet']);
        if (!path) return;
        setLocalPath(path);
        setColumns([]);
        setSelectedColumn("");
        setError(null);
        setIsLoadingColumns(true);
        try {
            const cols = await desktopAdapter.getDatasetColumns(path);
            setColumns(cols);
        } catch (e: any) {
            setError(e.message || "Failed to load columns");
        } finally {
            setIsLoadingColumns(false);
        }
    };

    const handleColumnSelect = async (column: string) => {
        setSelectedColumn(column);
        if (!column || !localPath) return;
        setError(null);
        setIsLoadingValues(true);
        try {
            const vals = await desktopAdapter.getDatasetColumnValues(localPath, column);
            onFieldChange("patterns", JSON.stringify(vals));
        } catch (e: any) {
            setError(e.message || "Failed to load values");
        } finally {
            setIsLoadingValues(false);
        }
    };

    return (
        <div className="space-y-4">
            <ListField
                label="Patterns"
                value={editValues.patterns || "[]"}
                onChange={(v) => onFieldChange("patterns", v)}
                placeholder="Enter a pattern..."
            />

            <div className="border-t border-white/10 pt-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Load from file
                </div>
                <div className="flex flex-col gap-2">
                    <ActionButton
                        icon={<FolderSearch className="w-4 h-4" />}
                        onClick={handleBrowse}
                        disabled={isLoadingColumns}
                        tone="blue"
                    >
                        {isLoadingColumns ? "Loading columns..." : "Browse Dataset File..."}
                    </ActionButton>

                    {localPath && (
                        <div className="font-mono text-[10px] text-blue-300 bg-blue-500/10 border border-blue-500/30 p-2.5 rounded-lg break-all">
                            <strong className="text-pink-400 mr-2 uppercase tracking-wide text-xs">File:</strong>
                            {localPath.split(/[\\/]/).pop()}
                        </div>
                    )}

                    {error && (
                        <div className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded">
                            {error}
                        </div>
                    )}

                    {columns.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-white drop-shadow-sm flex items-center gap-2">
                                Column
                                {isLoadingValues && <span className="text-emerald-400 animate-pulse text-[10px]">(Loading values...)</span>}
                            </label>
                            <select
                                value={selectedColumn}
                                onChange={(e) => handleColumnSelect(e.target.value)}
                                className="w-full glass-panel border border-pink-500/50 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold drop-shadow-sm focus:outline-none focus:border-emerald-500/50"
                                disabled={isLoadingValues}
                            >
                                <option value="">-- Select Column --</option>
                                {columns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/** Scan node: show columns as editable key-value pairs */
export function ScanForm({
    editValues,
    onFieldChange,
}: {
    editValues: Record<string, any>;
    onFieldChange: (key: string | null, value: any, newType?: string) => void;
}) {
    const data = editValues.data;
    const isObject = data && typeof data === "object" && !Array.isArray(data);
    const columns = isObject ? Object.keys(data) : [];

    const { isLoading, error, runFetch, browseForFile } = useDatasetPathFetch(
        (path) => desktopAdapter.getDatasetPreview(path),
        (previewData) => onFieldChange("data", previewData),
        undefined,
        "Failed to load dataset preview.",
    );

    const handleBrowse = async () => {
        const path = await browseForFile();
        if (path) {
            onFieldChange("path", path);
            runFetch(path);
        }
    };

    const addColumn = () => {
        const current = isObject ? { ...data } : {};
        const colName = `column_${Object.keys(current).length + 1}`;
        current[colName] = [];
        onFieldChange("data", current);
    };

    const removeColumn = (col: string) => {
        if (!isObject) return;
        const next = { ...data };
        delete next[col];
        onFieldChange("data", next);
    };

    const renameColumn = (oldName: string, newName: string) => {
        if (!isObject || !newName.trim() || newName === oldName) return;
        const entries = Object.entries(data);
        const newData: Record<string, any> = {};
        for (const [k, v] of entries) {
            newData[k === oldName ? newName.trim() : k] = v;
        }
        onFieldChange("data", newData);
    };

    const updateColumnValues = (col: string, rawValue: string) => {
        if (!isObject) return;
        // Parse comma-separated values, auto-detect numbers
        const values = rawValue.split(",").map(v => {
            const t = v.trim();
            if (t === "") return t;
            const num = Number(t);
            return isNaN(num) ? t : num;
        });
        onFieldChange("data", { ...data, [col]: values });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <ActionButton
                    icon={<FileText className="w-4 h-4" />}
                    onClick={() => onFieldChange(null, null, "file_reader")}
                    tone="teal"
                    className="mb-1"
                >
                    Leer desde archivo
                </ActionButton>
                <ActionButton
                    icon={<FolderSearch className="w-4 h-4" />}
                    onClick={handleBrowse}
                    disabled={isLoading}
                    tone="blue"
                >
                    {isLoading ? "Scanning dataset..." : "Browse Dataset File..."}
                </ActionButton>
                {editValues.path && (
                    <div className="text-sm bg-blue-500/10 shadow-md border border-blue-500/30 p-2.5 rounded-lg text-blue-300 break-all font-mono text-[10px]">
                        <strong className="text-pink-400 mr-2 uppercase tracking-wide text-xs">Selected:</strong>
                        {editValues.path.split(/[\\/]/).pop()}
                    </div>
                )}
                {error && (
                    <div className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded">
                        {error}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 mb-1">
                <Database size={14} className="text-blue-400" />
                <span className="text-xs text-gray-200 font-semibold font-semibold uppercase tracking-wide">
                    Dataset Columns
                </span>
            </div>

            {columns.length === 0 && (
                <div className="text-gray-200 font-semibold text-xs italic">
                    No columns defined yet. Add columns below.
                </div>
            )}

            {columns.map(col => (
                <div key={col} className="flex flex-col gap-1.5 p-3 bg-[var(--color-dark-glass)] rounded-lg border border-pink-500/50/50">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={col}
                            onChange={(e) => renameColumn(col, e.target.value)}
                            className="flex-1 glass-panel border border-pink-500/50/50 rounded px-2 py-1 text-xs text-white font-bold drop-shadow-sm font-mono focus:outline-none focus:border border-emerald-500/50 transition-colors"
                        />
                        <IconDeleteButton onClick={() => removeColumn(col)} />
                    </div>
                    <input
                        type="text"
                        placeholder="Values (comma-separated)"
                        value={Array.isArray(data[col]) ? data[col].join(", ") : String(data[col] || "")}
                        onChange={(e) => updateColumnValues(col, e.target.value)}
                        className="w-full glass-panel border border-dark rounded px-2 py-1 text-xs text-white font-bold drop-shadow-sm placeholder-gray focus:outline-none focus:border border-emerald-500/50 transition-colors"
                    />
                </div>
            ))}

            <DashedAddButton onClick={addColumn}>+ Add Column</DashedAddButton>
        </div>
    );
}

/** Rename node: show mapping as editable pairs */
export function RenameForm({
    editValues,
    onFieldChange,
    availableColumns,
}: {
    editValues: Record<string, any>;
    onFieldChange: (key: string, value: any) => void;
    availableColumns: string[];
}) {
    const mapping = editValues.mapping && typeof editValues.mapping === "object"
        ? editValues.mapping as Record<string, string>
        : {};
    const entries = Object.entries(mapping);

    const addMapping = () => {
        const next = { ...mapping, "": "" };
        onFieldChange("mapping", next);
    };

    const updateKey = (oldKey: string, newKey: string) => {
        const newMapping: Record<string, string> = {};
        for (const [k, v] of Object.entries(mapping)) {
            newMapping[k === oldKey ? newKey : k] = v;
        }
        onFieldChange("mapping", newMapping);
    };

    const updateValue = (key: string, newValue: string) => {
        onFieldChange("mapping", { ...mapping, [key]: newValue });
    };

    const removeMapping = (key: string) => {
        const next = { ...mapping };
        delete next[key];
        onFieldChange("mapping", next);
    };

    return (
        <div className="flex flex-col gap-3">
            <span className="text-xs text-gray-200 font-semibold font-semibold uppercase tracking-wide">
                Column Mapping
            </span>

            {entries.length === 0 && (
                <div className="text-gray-200 font-semibold text-xs italic">No mappings defined.</div>
            )}

            {entries.map(([key, val], i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-[var(--color-dark-glass)] rounded-lg border border-pink-500/50/50">
                    {availableColumns.length > 0 ? (
                        <select
                            value={key}
                            onChange={(e) => updateKey(key, e.target.value)}
                            className="flex-1 glass-panel border border-pink-500/50/50 rounded px-2 py-1 text-xs text-white font-bold drop-shadow-sm focus:outline-none focus:border border-emerald-500/50"
                        >
                            <option value="">Original...</option>
                            {availableColumns.map(c => (
                                <option key={c} value={c} className="glass-panel">{c}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            value={key}
                            placeholder="Original"
                            onChange={(e) => updateKey(key, e.target.value)}
                            className="flex-1 glass-panel border border-pink-500/50/50 rounded px-2 py-1 text-xs text-white font-bold drop-shadow-sm focus:outline-none focus:border border-emerald-500/50"
                        />
                    )}
                    <span className="text-gray-200 font-semibold text-xs">→</span>
                    <input
                        type="text"
                        value={val}
                        placeholder="New name"
                        onChange={(e) => updateValue(key, e.target.value)}
                        className="flex-1 glass-panel border border-pink-500/50/50 rounded px-2 py-1 text-xs text-white font-bold drop-shadow-sm focus:outline-none focus:border border-emerald-500/50"
                    />
                    <IconDeleteButton onClick={() => removeMapping(key)} />
                </div>
            ))}

            <DashedAddButton onClick={addMapping}>+ Add Mapping</DashedAddButton>
        </div>
    );
}

/** PatternField: shows a manually-editable text field for patterns */
function PatternField({
    argKey,
    args,
    isSimpleArgs,
    onFieldChange,
}: {
    argKey: string;
    args: Record<string, any>;
    isSimpleArgs: boolean;
    onFieldChange: (key: string, value: any) => void;
}) {
    const currentValue = isSimpleArgs ? (args[argKey] || "") : "";

    return (
        <TextField
            label={argKey === "sub" ? "Substring" : "Pattern"}
            placeholder={argKey === "sub" ? "e.g. prefix" : "e.g. Widget"}
            value={currentValue}
            onChange={(val) => onFieldChange("args", { ...args, [argKey]: val })}
        />
    );
}

/** Call node: method select + structured args instead of raw JSON */
export function CallForm({
    editValues,
    onFieldChange,
}: {
    editValues: Record<string, any>;
    onFieldChange: (key: string, value: any) => void;
}) {
    const method = editValues.method || "";

    // Extract known simple arguments
    const args = editValues.args || {};
    const isSimpleArgs = typeof args === "object" && !Array.isArray(args);

    return (
        <div className="flex flex-col gap-4">
            <SelectField
                label="Method"
                value={method}
                options={COMMON_CALL_METHODS}
                onChange={(val) => onFieldChange("method", val)}
            />

            {method.startsWith("str.contains") && (
                <PatternField
                    argKey={CALL_PATTERN_FIELDS["str.contains"]}
                    args={args}
                    isSimpleArgs={isSimpleArgs}
                    onFieldChange={onFieldChange}
                />
            )}
            {(method === "str.starts_with" || method === "str.ends_with") && (
                <PatternField
                    argKey={CALL_PATTERN_FIELDS[method]}
                    args={args}
                    isSimpleArgs={isSimpleArgs}
                    onFieldChange={onFieldChange}
                />
            )}
            {(method === "str.replace" || method === "str.replace_all") && (
                <>
                    <PatternField
                        argKey={CALL_PATTERN_FIELDS[method]}
                        args={args}
                        isSimpleArgs={isSimpleArgs}
                        onFieldChange={onFieldChange}
                    />
                    <TextField
                        label="Replacement"
                        placeholder="e.g. new_text"
                        value={isSimpleArgs ? (args.value || "") : ""}
                        onChange={(val) => onFieldChange("args", { ...args, value: val })}
                    />
                </>
            )}
            {(method === "str.extract") && (
                <PatternField
                    argKey={CALL_PATTERN_FIELDS["str.extract"]}
                    args={args}
                    isSimpleArgs={isSimpleArgs}
                    onFieldChange={onFieldChange}
                />
            )}
            {(method === "str.count_matches") && (
                <PatternField
                    argKey={CALL_PATTERN_FIELDS["str.count_matches"]}
                    args={args}
                    isSimpleArgs={isSimpleArgs}
                    onFieldChange={onFieldChange}
                />
            )}
            {(method === "str.split") && (
                <TextField
                    label="By (Separator)"
                    placeholder="e.g. ,"
                    value={isSimpleArgs ? (args.by || "") : ""}
                    onChange={(val) => onFieldChange("args", { ...args, by: val })}
                />
            )}
            {(method === "str.slice") && (
                <>
                    <TextField
                        label="Offset"
                        placeholder="e.g. 0"
                        value={isSimpleArgs ? String(args.offset ?? "") : ""}
                        onChange={(val) => onFieldChange("args", { ...args, offset: Number(val) || 0 })}
                    />
                    <TextField
                        label="Length"
                        placeholder="e.g. 5"
                        value={isSimpleArgs ? String(args.length ?? "") : ""}
                        onChange={(val) => onFieldChange("args", { ...args, length: Number(val) || undefined })}
                    />
                </>
            )}
            {(method === "round") && (
                <TextField
                    label="Decimals"
                    placeholder="e.g. 2"
                    value={isSimpleArgs ? String(args.decimals ?? "") : ""}
                    onChange={(val) => onFieldChange("args", { ...args, decimals: Number(val) || 0 })}
                />
            )}
            {(method === "shift" || method === "diff") && (
                <TextField
                    label="N"
                    placeholder="e.g. 1"
                    value={isSimpleArgs ? String(args.n ?? "") : ""}
                    onChange={(val) => onFieldChange("args", { ...args, n: Number(val) || 1 })}
                />
            )}
        </div>
    );
}

/**
 * SeriesPatternField: Pattern selector for Series nodes.
 */
export function SeriesPatternField({
    propertyKey,
    currentValue,
    onFieldChange,
}: {
    propertyKey: string;
    currentValue: string;
    onFieldChange: (key: string, value: any) => void;
}) {
    return (
        <TextField
            label="Pattern"
            placeholder="e.g. Widget"
            value={currentValue}
            onChange={(val) => onFieldChange(propertyKey, val)}
        />
    );
}
