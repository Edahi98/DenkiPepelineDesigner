import type { ReactNode } from "react";
import { Database } from "lucide-react";
import { Button } from "../../../shared/atoms/Button";
import { ToggleSwitch } from "../../../shared/atoms/ToggleSwitch";
import { TextField, SelectField, MultiSelectField } from "../../molecules/PropertyField";
import { ChainForm } from "../../molecules/ChainForm";
import { FileReaderPanel } from "../../file-reader/FileReaderPanel";
import { desktopAdapter } from "../../../shared/adapters/desktop-adapter";
import type { FieldSpec, FormContext, NodeFormEntry } from "./field-spec";
import { ScanForm, IsInForm, ContainsAnyForm, RenameForm, CallForm } from "./sub-forms";
import { DTYPE_OPTIONS_OPTIONAL, DTYPE_OPTIONS_REQUIRED } from "./data/dtype-options";
import { WRITE_FILE_TYPES, MULTI_ML_TYPES, SUPERVISED_ML_TYPES, VECTORIZER_ML_TYPES, DIMENSIONALITY_ML_TYPES } from "./data/node-type-groups";
import {
    BINARY_OPERATORS,
    UNARY_OPERATORS,
    JOIN_HOW_OPTIONS,
    FILL_NULL_STRATEGY_OPTIONS,
    UNIQUE_KEEP_OPTIONS,
    ROUND_MODE_OPTIONS,
    QUANTILE_INTERPOLATION_OPTIONS,
    INTERPOLATE_METHOD_OPTIONS,
    RANK_METHOD_OPTIONS,
    IS_BETWEEN_CLOSED_OPTIONS,
    STRPTIME_DTYPE_OPTIONS,
    STR_DECODE_ENCODING_OPTIONS,
    TIME_UNIT_OPTIONS,
    ROLLING_CLOSED_OPTIONS,
    SVC_KERNEL_OPTIONS,
    SGD_LOSS_OPTIONS,
} from "./data/field-options";

/**
 * Declarative registry of node forms — the single place a new AST node
 * type's form gets registered. Mirrors `node_ports.ts`'s table-instead-
 * of-switch pattern: a node type is either a plain field list (rendered
 * generically by `renderFieldSpecs` in NodePanel) or, for shapes a field
 * list can't express, a small render function. Either way, adding or
 * changing a node type's form means editing exactly one entry here —
 * never a `case` in a shared switch that every node type used to share.
 *
 * Two node type strings — `sort` and `fill_null` — used to appear as
 * TWO separate `case` labels in the old switch (once for the DataFrame
 * step shape, once for the Series expression shape). A `switch` takes
 * the first matching label, so the second was unreachable dead code:
 * a Series `sort`/`fill_null` node silently rendered the DataFrame
 * form. This registry can't hold two entries under one key, so each
 * keeps only the form that was actually reachable (DataFrame's),
 * preserving today's real behavior rather than silently changing it.
 * The Series-only "Maintain Order" switch on `sort` was similarly only
 * ever reachable via `arg_sort` and never actually true there — dropped
 * along with the rest of the dead branch.
 *
 * The option lists and node-type groupings this file references (which
 * dtypes a select offers, which node types share the ML form, ...) live
 * in `./data/` — this file is the field/render logic, `data/` is the
 * plain data it's built from.
 */

const numberField = (val: string, fallback: number): number => Number(val) || fallback;
const nullableNumber = (val: string): number | null => (val === "" ? null : Number(val));
const stringOrUndefined = (v: unknown): string => (v !== undefined && v !== null ? String(v) : "");

function writeFileForm(ctx: FormContext): ReactNode {
    const { type, editValues, handleFieldChange } = ctx;
    const saveType = type === "write_csv" ? "CSV" : type === "write_excel" ? "Excel" : type === "write_html" ? "HTML" : "JSON";
    return (
        <div className="flex flex-col gap-4">
            <TextField
                label="Ruta de Archivo (Path)"
                placeholder="Ej. C:\export"
                value={editValues.path || ""}
                onChange={(val) => handleFieldChange("path", val)}
            />
            <Button
                onClick={async () => {
                    const path = await desktopAdapter.selectSavePath("export", saveType);
                    if (path) {
                        handleFieldChange("path", path);
                    }
                }}
            >
                Seleccionar Ruta
            </Button>
        </div>
    );
}

function joinForm(ctx: FormContext): ReactNode {
    const { editValues, handleFieldChange, availableColumns, columnOptions } = ctx;
    return (
        <div className="flex flex-col gap-4">
            {availableColumns.length > 0 ? (
                <>
                    <SelectField label="On Column" value={editValues.on || ""} options={columnOptions} onChange={(val) => handleFieldChange("on", val)} />
                    <SelectField label="Left On" value={editValues.left_on || ""} options={columnOptions} onChange={(val) => handleFieldChange("left_on", val)} />
                    <SelectField label="Right On" value={editValues.right_on || ""} options={columnOptions} onChange={(val) => handleFieldChange("right_on", val)} />
                </>
            ) : (
                <>
                    <TextField label="On Column" placeholder="e.g. id" value={editValues.on || ""} onChange={(val) => handleFieldChange("on", val)} />
                    <TextField label="Left On" placeholder="e.g. key_left" value={editValues.left_on || ""} onChange={(val) => handleFieldChange("left_on", val)} />
                    <TextField label="Right On" placeholder="e.g. key_right" value={editValues.right_on || ""} onChange={(val) => handleFieldChange("right_on", val)} />
                </>
            )}
            <SelectField label="How" value={editValues.how || "inner"} options={JOIN_HOW_OPTIONS} onChange={(val) => handleFieldChange("how", val)} />
            <TextField label="Suffix" placeholder="e.g. _right" value={editValues.suffix || ""} onChange={(val) => handleFieldChange("suffix", val)} />
        </div>
    );
}

function mlNodeForm(ctx: FormContext): ReactNode {
    const { type, editValues, handleFieldChange, availableColumns, columnOptions } = ctx;
    const isSupervised = SUPERVISED_ML_TYPES.includes(type);
    const isVectorizer = VECTORIZER_ML_TYPES.includes(type);
    const isDimensionality = DIMENSIONALITY_ML_TYPES.includes(type);

    return (
        <div className="flex flex-col gap-4">
            {isVectorizer ? (
                <SelectField label="Input Column" value={editValues.input_column || ""} options={columnOptions} onChange={(val) => handleFieldChange("input_column", val)} />
            ) : (
                <MultiSelectField
                    label="Feature Columns"
                    options={availableColumns}
                    selected={Array.isArray(editValues.feature_columns) ? editValues.feature_columns : []}
                    onChange={(val) => handleFieldChange("feature_columns", val)}
                    placeholder="Select feature columns..."
                />
            )}

            {isSupervised && (
                <SelectField label="Target Column" value={editValues.target_column || ""} options={columnOptions} onChange={(val) => handleFieldChange("target_column", val)} />
            )}

            <TextField
                label={isVectorizer || isDimensionality ? "Output Prefix" : "Output Column"}
                placeholder={isVectorizer || isDimensionality ? "e.g. out_" : "e.g. prediction"}
                value={editValues.output_prefix || editValues.output_column || ""}
                onChange={(val) => handleFieldChange(isVectorizer || isDimensionality ? "output_prefix" : "output_column", val)}
            />

            {type === "logistic_regression" && (
                <>
                    <TextField
                        label="Max Iterations"
                        value={editValues.params?.max_iter !== undefined ? String(editValues.params.max_iter) : "100"}
                        onChange={(val) => handleFieldChange("params", { ...(editValues.params || {}), max_iter: Number(val) || 100 })}
                    />
                    <TextField
                        label="C (Regularization)"
                        value={editValues.params?.C !== undefined ? String(editValues.params.C) : "1.0"}
                        onChange={(val) => handleFieldChange("params", { ...(editValues.params || {}), C: Number(val) || 1.0 })}
                    />
                </>
            )}
            {type === "svc" && (
                <SelectField
                    label="Kernel"
                    value={editValues.params?.kernel || "rbf"}
                    options={SVC_KERNEL_OPTIONS}
                    onChange={(val) => handleFieldChange("params", { ...(editValues.params || {}), kernel: val })}
                />
            )}
            {type === "multinomial_nb" && (
                <TextField
                    label="Alpha"
                    value={editValues.params?.alpha !== undefined ? String(editValues.params.alpha) : "1.0"}
                    onChange={(val) => handleFieldChange("params", { ...(editValues.params || {}), alpha: Number(val) || 1.0 })}
                />
            )}
            {type === "sgd_classifier" && (
                <SelectField
                    label="Loss"
                    value={editValues.params?.loss || "hinge"}
                    options={SGD_LOSS_OPTIONS}
                    onChange={(val) => handleFieldChange("params", { ...(editValues.params || {}), loss: val })}
                />
            )}
            {(type === "kmeans" || type === "agglomerative_clustering") && (
                <TextField
                    label="Number of Clusters"
                    value={editValues.params?.n_clusters !== undefined ? String(editValues.params.n_clusters) : (type === "kmeans" ? "8" : "2")}
                    onChange={(val) => handleFieldChange("params", { ...(editValues.params || {}), n_clusters: Number(val) || (type === "kmeans" ? 8 : 2) })}
                />
            )}
            {type === "dbscan" && (
                <>
                    <TextField
                        label="Eps (Radius)"
                        value={editValues.params?.eps !== undefined ? String(editValues.params.eps) : "0.5"}
                        onChange={(val) => handleFieldChange("params", { ...(editValues.params || {}), eps: Number(val) || 0.5 })}
                    />
                    <TextField
                        label="Min Samples"
                        value={editValues.params?.min_samples !== undefined ? String(editValues.params.min_samples) : "5"}
                        onChange={(val) => handleFieldChange("params", { ...(editValues.params || {}), min_samples: Number(val) || 5 })}
                    />
                </>
            )}
            {(type === "truncated_svd" || type === "lda" || type === "nmf") && (
                <TextField
                    label="Number of Components"
                    value={editValues.params?.n_components !== undefined ? String(editValues.params.n_components) : "2"}
                    onChange={(val) => handleFieldChange("params", { ...(editValues.params || {}), n_components: Number(val) || 2 })}
                />
            )}
            {(type === "tfidf_vectorizer" || type === "count_vectorizer") && (
                <TextField
                    label="Max Features"
                    value={editValues.params?.max_features !== undefined ? String(editValues.params.max_features) : "100"}
                    onChange={(val) => handleFieldChange("params", { ...(editValues.params || {}), max_features: Number(val) || 100 })}
                />
            )}
            {type === "hashing_vectorizer" && (
                <TextField
                    label="Number of Features"
                    value={editValues.params?.n_features !== undefined ? String(editValues.params.n_features) : "100"}
                    onChange={(val) => handleFieldChange("params", { ...(editValues.params || {}), n_features: Number(val) || 100 })}
                />
            )}
        </div>
    );
}

function chainForm(ctx: FormContext): ReactNode {
    const incomingCount = (ctx.allEdges ?? []).filter((e) => e.target === ctx.node.id).length;
    const currentOp: "|" | "&" = ctx.editValues.op === "&" ? "&" : "|";
    return (
        <ChainForm
            op={currentOp}
            operandCount={incomingCount}
            onOpChange={(val) => ctx.handleFieldChange("op", val)}
        />
    );
}

function fitForm(ctx: FormContext): ReactNode {
    const { editValues, handleFieldChange } = ctx;
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-fuchsia-100 mb-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Conéctalo a un nodo de algoritmo para persistir el modelo en disco.</span>
            </div>
            <div className="flex items-center">
                <ToggleSwitch
                    label="Force Retrain"
                    isSelected={!!editValues.force_fit}
                    onChange={(val) => handleFieldChange("force_fit", val)}
                />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                Si está activo, re-entrenará el modelo ignorando la caché.
            </p>
        </div>
    );
}

export const NODE_FORM_SCHEMAS: Record<string, NodeFormEntry> = {
    col: [
        { kind: "select", key: "name", label: "Column Name", options: (c) => c.columnOptions, getValue: (c) => c.editValues.name || "", onChange: (v, c) => c.handleFieldChange("name", v) },
    ],
    get_column: [
        { kind: "select", key: "name", label: "Column Name", options: (c) => c.columnOptions, getValue: (c) => c.editValues.name || "", onChange: (v, c) => c.handleFieldChange("name", v) },
    ],
    lit: [
        { kind: "text", key: "value", label: "Value", placeholder: "e.g. 100, Widget", getValue: (c) => stringOrUndefined(c.editValues.value), onChange: (v, c) => c.handleFieldChange("value", v) },
        { kind: "select", key: "dtype", label: "Data Type", options: DTYPE_OPTIONS_OPTIONAL, getValue: (c) => c.editValues.dtype || "", onChange: (v, c) => c.handleFieldChange("dtype", v) },
    ],
    binary: [
        { kind: "select", key: "op", label: "Operator", options: BINARY_OPERATORS, getValue: (c) => c.editValues.op || "", onChange: (v, c) => c.handleFieldChange("op", v) },
    ],
    unary: [
        { kind: "select", key: "op", label: "Operator", options: UNARY_OPERATORS, getValue: (c) => c.editValues.op || "", onChange: (v, c) => c.handleFieldChange("op", v) },
    ],
    cast: [
        { kind: "select", key: "dtype", label: "Target Type", options: DTYPE_OPTIONS_REQUIRED, getValue: (c) => c.editValues.dtype || "", onChange: (v, c) => c.handleFieldChange("dtype", v) },
    ],
    alias: [nameField("New Name", "e.g. Total_Sales")],
    unpivot: [nameField("Name", "e.g. Total_Sales")],
    to_frame: [nameField("Nombre de la columna (Opcional)", "e.g. output_col")],
    scan: (c) => <ScanForm editValues={c.editValues} onFieldChange={c.handleFieldChange} />,
    file_reader: (c) => (
        <FileReaderPanel
            path={c.editValues.path || ""}
            data={c.editValues.data || {}}
            onFieldChange={c.handleFieldChange}
            onSwitchToScan={() => c.handleFieldChange(null, null, "scan")}
        />
    ),
    group_by: [
        { kind: "multiselect", key: "by", label: "Group By Columns", options: (c) => c.availableColumns, getValue: (c) => Array.isArray(c.editValues.by) ? c.editValues.by : [], onChange: (v, c) => c.handleFieldChange("by", v), placeholder: "Select columns..." },
    ],
    sort: [
        { kind: "multiselect", key: "by", label: "Sort By Columns", options: (c) => c.availableColumns, getValue: (c) => Array.isArray(c.editValues.by) ? c.editValues.by : [], onChange: (v, c) => c.handleFieldChange("by", v), placeholder: "Select columns..." },
        { kind: "switch", key: "descending", label: "Descending", getValue: (c) => !!c.editValues.descending, onChange: (v, c) => c.handleFieldChange("descending", v) },
        { kind: "switch", key: "nulls_last", label: "Nulls Last", getValue: (c) => !!c.editValues.nulls_last, onChange: (v, c) => c.handleFieldChange("nulls_last", v) },
    ],
    join: joinForm,
    slice: [
        { kind: "text", key: "offset", label: "Offset", placeholder: "e.g. 0", getValue: (c) => stringOrUndefined(c.editValues.offset), onChange: (v, c) => c.handleFieldChange("offset", v) },
        { kind: "text", key: "length", label: "Length", placeholder: "e.g. 10", getValue: (c) => stringOrUndefined(c.editValues.length), onChange: (v, c) => c.handleFieldChange("length", v) },
    ],
    head: [nRowsField()],
    tail: [nRowsField()],
    rename: (c) => <RenameForm editValues={c.editValues} onFieldChange={c.handleFieldChange} availableColumns={c.availableColumns} />,
    drop: [
        { kind: "multiselect", key: "columns", label: "Columns to Drop", options: (c) => c.availableColumns, getValue: (c) => Array.isArray(c.editValues.columns) ? c.editValues.columns : [], onChange: (v, c) => c.handleFieldChange("columns", v), placeholder: "Select columns to drop..." },
    ],
    drop_nulls: [
        { kind: "multiselect", key: "subset", label: "Subset Columns", options: (c) => c.availableColumns, getValue: (c) => Array.isArray(c.editValues.subset) ? c.editValues.subset : [], onChange: (v, c) => c.handleFieldChange("subset", v), placeholder: "Select subset columns..." },
    ],
    fill_null: [
        { kind: "text", key: "value", label: "Value", placeholder: "e.g. 0, unknown", getValue: (c) => stringOrUndefined(c.editValues.value), onChange: (v, c) => c.handleFieldChange("value", v) },
        { kind: "select", key: "strategy", label: "Strategy", options: FILL_NULL_STRATEGY_OPTIONS, getValue: (c) => c.editValues.strategy || "", onChange: (v, c) => c.handleFieldChange("strategy", v) },
    ],
    unique: [
        { kind: "multiselect", key: "subset", label: "Subset Columns", options: (c) => c.availableColumns, getValue: (c) => Array.isArray(c.editValues.subset) ? c.editValues.subset : [], onChange: (v, c) => c.handleFieldChange("subset", v), placeholder: "Select subset columns..." },
        { kind: "select", key: "keep", label: "Keep Strategy", options: UNIQUE_KEEP_OPTIONS, getValue: (c) => c.editValues.keep || "first", onChange: (v, c) => c.handleFieldChange("keep", v) },
    ],
    over: [
        { kind: "multiselect", key: "partition_by", label: "Partition By Columns", options: (c) => c.availableColumns, getValue: (c) => Array.isArray(c.editValues.partition_by) ? c.editValues.partition_by : [], onChange: (v, c) => c.handleFieldChange("partition_by", v), placeholder: "Select partition columns..." },
    ],
    sort_expr: [
        { kind: "switch", key: "descending", label: "Descending", getValue: (c) => !!c.editValues.descending, onChange: (v, c) => c.handleFieldChange("descending", v) },
        { kind: "switch", key: "nulls_last", label: "Nulls Last", getValue: (c) => !!c.editValues.nulls_last, onChange: (v, c) => c.handleFieldChange("nulls_last", v) },
    ],
    call: (c) => <CallForm editValues={c.editValues} onFieldChange={c.handleFieldChange} />,
    from_list: [
        { kind: "list", key: "values", label: "Values", getValue: (c) => c.editValues.values || "[]", onChange: (v, c) => c.handleFieldChange("values", v), placeholder: "Enter a value..." },
        { kind: "select", key: "dtype", label: "Data Type", options: DTYPE_OPTIONS_OPTIONAL, getValue: (c) => c.editValues.dtype || "", onChange: (v, c) => c.handleFieldChange("dtype", v) },
    ],
    from_scalar: [
        { kind: "text", key: "value", label: "Value", placeholder: "e.g. 42, 3.14, true", getValue: (c) => stringOrUndefined(c.editValues.value), onChange: (v, c) => c.handleFieldChange("value", v) },
        { kind: "select", key: "dtype", label: "Data Type", options: DTYPE_OPTIONS_REQUIRED, getValue: (c) => c.editValues.dtype || "", onChange: (v, c) => c.handleFieldChange("dtype", v) },
    ],
    round: [
        { kind: "text", key: "decimals", label: "Decimals", placeholder: "e.g. 2", getValue: (c) => stringOrUndefined(c.editValues.decimals) || "0", onChange: (v, c) => c.handleFieldChange("decimals", numberField(v, 0)) },
        { kind: "select", key: "mode", label: "Mode", options: ROUND_MODE_OPTIONS, getValue: (c) => c.editValues.mode || "", onChange: (v, c) => c.handleFieldChange("mode", v || null) },
    ],
    pow: [
        { kind: "text", key: "exponent", label: "Exponent", placeholder: "e.g. 2", getValue: (c) => c.editValues.exponent !== undefined ? String(c.editValues.exponent) : "2", onChange: (v, c) => c.handleFieldChange("exponent", numberField(v, 2)) },
    ],
    clip: [
        { kind: "text", key: "min_bound", label: "Min Bound", placeholder: "e.g. 0 (leave empty for -∞)", getValue: (c) => c.editValues.min_bound !== undefined && c.editValues.min_bound !== null ? String(c.editValues.min_bound) : "", onChange: (v, c) => c.handleFieldChange("min_bound", nullableNumber(v)) },
        { kind: "text", key: "max_bound", label: "Max Bound", placeholder: "e.g. 100 (leave empty for ∞)", getValue: (c) => c.editValues.max_bound !== undefined && c.editValues.max_bound !== null ? String(c.editValues.max_bound) : "", onChange: (v, c) => c.handleFieldChange("max_bound", nullableNumber(v)) },
    ],
    fill_nan: [
        { kind: "text", key: "value", label: "Value", placeholder: "e.g. 0", getValue: (c) => c.editValues.value !== undefined ? String(c.editValues.value) : "0", onChange: (v, c) => c.handleFieldChange("value", numberField(v, 0)) },
    ],
    quantile: [
        { kind: "text", key: "quantile", label: "Quantile", placeholder: "e.g. 0.5", getValue: (c) => c.editValues.quantile !== undefined ? String(c.editValues.quantile) : "0.5", onChange: (v, c) => c.handleFieldChange("quantile", numberField(v, 0.5)) },
        { kind: "select", key: "interpolation", label: "Interpolation", options: QUANTILE_INTERPOLATION_OPTIONS, getValue: (c) => c.editValues.interpolation || "nearest", onChange: (v, c) => c.handleFieldChange("interpolation", v) },
    ],
    std: [ddofField()],
    var: [ddofField()],
    skew: [
        { kind: "switch", key: "bias", label: "Bias", getValue: (c) => c.editValues.bias !== false, onChange: (v, c) => c.handleFieldChange("bias", v) },
    ],
    kurtosis: [
        { kind: "switch", key: "fisher", label: "Fisher", getValue: (c) => c.editValues.fisher !== false, onChange: (v, c) => c.handleFieldChange("fisher", v) },
        { kind: "switch", key: "bias", label: "Bias", getValue: (c) => c.editValues.bias !== false, onChange: (v, c) => c.handleFieldChange("bias", v) },
    ],
    entropy: [
        { kind: "text", key: "base", label: "Base", placeholder: "e.g. 2", getValue: (c) => c.editValues.base !== undefined ? String(c.editValues.base) : "2", onChange: (v, c) => c.handleFieldChange("base", numberField(v, 2)) },
    ],
    interpolate: [
        { kind: "select", key: "method", label: "Method", options: INTERPOLATE_METHOD_OPTIONS, getValue: (c) => c.editValues.method || "linear", onChange: (v, c) => c.handleFieldChange("method", v) },
    ],
    // `sort` (Series) was unreachable dead code in the old switch (masked
    // by the DataFrame `sort` case above) — only `arg_sort` ever reached
    // this shape, and its "Maintain Order" switch (`type === "sort"`) was
    // therefore always false. See file header note.
    arg_sort: [
        { kind: "switch", key: "descending", label: "Descending", getValue: (c) => !!c.editValues.descending, onChange: (v, c) => c.handleFieldChange("descending", v) },
        { kind: "switch", key: "nulls_last", label: "Nulls Last", getValue: (c) => !!c.editValues.nulls_last, onChange: (v, c) => c.handleFieldChange("nulls_last", v) },
    ],
    shift: [nField("1")],
    diff: [nField("1")],
    pct_change: [nField("1")],
    ewm_mean: ewmFields(),
    ewm_std: ewmFields(),
    ewm_var: ewmFields(),
    rolling_mean: rollingFields(),
    rolling_sum: rollingFields(),
    rolling_min: rollingFields(),
    rolling_max: rollingFields(),
    rolling_std: rollingFields(),
    rolling_var: rollingFields(),
    cum_sum: [reverseField()],
    cum_prod: [reverseField()],
    cum_min: [reverseField()],
    cum_max: [reverseField()],
    cum_count: [reverseField()],
    sample: [
        { kind: "text", key: "n", label: "N (number of samples)", placeholder: "e.g. 10", getValue: (c) => c.editValues.n !== undefined && c.editValues.n !== null ? String(c.editValues.n) : "", onChange: (v, c) => c.handleFieldChange("n", nullableNumber(v)) },
        { kind: "text", key: "fraction", label: "Fraction (0.0 to 1.0)", placeholder: "e.g. 0.1", getValue: (c) => c.editValues.fraction !== undefined && c.editValues.fraction !== null ? String(c.editValues.fraction) : "", onChange: (v, c) => c.handleFieldChange("fraction", nullableNumber(v)) },
        { kind: "switch", key: "with_replacement", label: "With Replacement", getValue: (c) => !!c.editValues.with_replacement, onChange: (v, c) => c.handleFieldChange("with_replacement", v) },
        seedField(),
    ],
    shuffle: [seedField()],
    gather: [indicesField()],
    take: [indicesField()],
    gather_every: [
        { kind: "text", key: "n", label: "N (take every N-th)", placeholder: "e.g. 2", getValue: (c) => c.editValues.n !== undefined ? String(c.editValues.n) : "2", onChange: (v, c) => c.handleFieldChange("n", numberField(v, 2)) },
        { kind: "text", key: "offset", label: "Offset", placeholder: "e.g. 0", getValue: (c) => c.editValues.offset !== undefined ? String(c.editValues.offset) : "0", onChange: (v, c) => c.handleFieldChange("offset", numberField(v, 0)) },
    ],
    to_dummies: [
        { kind: "text", key: "separator", label: "Separator", placeholder: "e.g. _", getValue: (c) => c.editValues.separator || "_", onChange: (v, c) => c.handleFieldChange("separator", v) },
        { kind: "switch", key: "drop_first", label: "Drop First", getValue: (c) => !!c.editValues.drop_first, onChange: (v, c) => c.handleFieldChange("drop_first", v) },
    ],
    cut: [
        { kind: "list", key: "breaks", label: "Breaks", getValue: (c) => c.editValues.breaks || "[]", onChange: (v, c) => c.handleFieldChange("breaks", v), placeholder: "Enter a break value..." },
        nullableLabelsField(),
        leftClosedField(),
        { kind: "switch", key: "include_breaks", label: "Include Breaks", getValue: (c) => !!c.editValues.include_breaks, onChange: (v, c) => c.handleFieldChange("include_breaks", v) },
    ],
    qcut: [
        { kind: "list", key: "quantiles", label: "Quantiles", getValue: (c) => c.editValues.quantiles || "[]", onChange: (v, c) => c.handleFieldChange("quantiles", v), placeholder: "Enter a quantile value..." },
        nullableLabelsField(),
        leftClosedField(),
        { kind: "switch", key: "allow_duplicates", label: "Allow Duplicates", getValue: (c) => !!c.editValues.allow_duplicates, onChange: (v, c) => c.handleFieldChange("allow_duplicates", v) },
    ],
    hash: [
        { kind: "text", key: "seed", label: "Seed", placeholder: "e.g. 0", getValue: (c) => c.editValues.seed !== undefined ? String(c.editValues.seed) : "0", onChange: (v, c) => c.handleFieldChange("seed", numberField(v, 0)) },
        { kind: "text", key: "seed_1", label: "Seed 1 (optional)", placeholder: "e.g. 1", getValue: (c) => c.editValues.seed_1 !== undefined && c.editValues.seed_1 !== null ? String(c.editValues.seed_1) : "", onChange: (v, c) => c.handleFieldChange("seed_1", nullableNumber(v)) },
        { kind: "text", key: "seed_2", label: "Seed 2 (optional)", placeholder: "e.g. 2", getValue: (c) => c.editValues.seed_2 !== undefined && c.editValues.seed_2 !== null ? String(c.editValues.seed_2) : "", onChange: (v, c) => c.handleFieldChange("seed_2", nullableNumber(v)) },
        { kind: "text", key: "seed_3", label: "Seed 3 (optional)", placeholder: "e.g. 3", getValue: (c) => c.editValues.seed_3 !== undefined && c.editValues.seed_3 !== null ? String(c.editValues.seed_3) : "", onChange: (v, c) => c.handleFieldChange("seed_3", nullableNumber(v)) },
    ],
    rank: [
        { kind: "select", key: "method", label: "Method", options: RANK_METHOD_OPTIONS, getValue: (c) => c.editValues.method || "average", onChange: (v, c) => c.handleFieldChange("method", v) },
        { kind: "switch", key: "descending", label: "Descending", getValue: (c) => !!c.editValues.descending, onChange: (v, c) => c.handleFieldChange("descending", v) },
        { kind: "text", key: "seed", label: "Seed (for random method)", placeholder: "e.g. 42 (optional)", getValue: (c) => c.editValues.seed !== undefined && c.editValues.seed !== null ? String(c.editValues.seed) : "", onChange: (v, c) => c.handleFieldChange("seed", nullableNumber(v)) },
    ],
    contains_any: (c) => <ContainsAnyForm editValues={c.editValues} onFieldChange={c.handleFieldChange} />,
    is_in: (c) => <IsInForm editValues={c.editValues} onFieldChange={c.handleFieldChange} />,
    combine_conditions: (c) => {
        const operator: string = c.editValues.operator || "AND";
        return (
            <div className="flex flex-col gap-4">
                <SelectField
                    label="Operator"
                    value={operator}
                    options={["AND", "OR", "XOR", "NOT"]}
                    onChange={(v) => c.handleFieldChange("operator", v)}
                />
                <p className="text-[10px] text-gray-400">
                    Conecta las series booleanas al puerto <span className="text-cyan-400 font-semibold">conds</span> del nodo. Puedes conectar tantas como necesites.
                    {operator === "NOT" && " (NOT aplica solo a la primera condición conectada)"}
                </p>
            </div>
        );
    },
    series_filter: (c) => (
        <div className="flex flex-col gap-4">
            <ToggleSwitch
                label="Self Filter — la serie se filtra a sí misma"
                isSelected={!!c.editValues.self_filter}
                onChange={(v) => c.handleFieldChange("self_filter", v)}
            />
        </div>
    ),
    is_between: [
        { kind: "text", key: "lower", label: "Lower Bound", placeholder: "e.g. 0", getValue: (c) => c.editValues.lower !== undefined && c.editValues.lower !== null ? String(c.editValues.lower) : "", onChange: (v, c) => c.handleFieldChange("lower", nullableNumber(v)) },
        { kind: "text", key: "upper", label: "Upper Bound", placeholder: "e.g. 100", getValue: (c) => c.editValues.upper !== undefined && c.editValues.upper !== null ? String(c.editValues.upper) : "", onChange: (v, c) => c.handleFieldChange("upper", nullableNumber(v)) },
        { kind: "select", key: "closed", label: "Closed", options: IS_BETWEEN_CLOSED_OPTIONS, getValue: (c) => c.editValues.closed || "both", onChange: (v, c) => c.handleFieldChange("closed", v) },
    ],
    str_contains: [patternField()],
    str_count_matches: [patternField()],
    str_extract: [patternField()],
    str_extract_all: [patternField()],
    str_starts_with: [
        { kind: "text", key: "prefix", label: "Prefix", placeholder: "e.g. pre", getValue: (c) => c.editValues.prefix || "", onChange: (v, c) => c.handleFieldChange("prefix", v) },
    ],
    str_ends_with: [
        { kind: "text", key: "suffix", label: "Suffix", placeholder: "e.g. suf", getValue: (c) => c.editValues.suffix || "", onChange: (v, c) => c.handleFieldChange("suffix", v) },
    ],
    str_replace: [patternField(), valueField()],
    str_replace_all: [patternField(), valueField()],
    str_slice: [
        { kind: "text", key: "offset", label: "Offset", placeholder: "e.g. 0", getValue: (c) => c.editValues.offset !== undefined ? String(c.editValues.offset) : "0", onChange: (v, c) => c.handleFieldChange("offset", numberField(v, 0)) },
        { kind: "text", key: "length", label: "Length", placeholder: "e.g. 5 (optional)", getValue: (c) => c.editValues.length !== undefined && c.editValues.length !== null ? String(c.editValues.length) : "", onChange: (v, c) => c.handleFieldChange("length", nullableNumber(v)) },
    ],
    str_split: [
        { kind: "text", key: "by", label: "By", placeholder: "e.g. ,", getValue: (c) => c.editValues.by || ",", onChange: (v, c) => c.handleFieldChange("by", v) },
        { kind: "switch", key: "inclusive", label: "Inclusive", getValue: (c) => !!c.editValues.inclusive, onChange: (v, c) => c.handleFieldChange("inclusive", v) },
    ],
    str_zfill: strJustFields(),
    str_ljust: strJustFields(),
    str_rjust: strJustFields(),
    str_strptime: [
        { kind: "select", key: "dtype", label: "Data Type", options: STRPTIME_DTYPE_OPTIONS, getValue: (c) => c.editValues.dtype || "Date", onChange: (v, c) => c.handleFieldChange("dtype", v) },
        { kind: "text", key: "format", label: "Format", placeholder: "e.g. %Y-%m-%d", getValue: (c) => c.editValues.format || "%Y-%m-%d", onChange: (v, c) => c.handleFieldChange("format", v) },
        strictSwitch(),
        { kind: "switch", key: "exact", label: "Exact", getValue: (c) => c.editValues.exact !== false, onChange: (v, c) => c.handleFieldChange("exact", v) },
        { kind: "switch", key: "cache", label: "Cache", getValue: (c) => c.editValues.cache !== false, onChange: (v, c) => c.handleFieldChange("cache", v) },
    ],
    str_decode: [
        { kind: "select", key: "encoding", label: "Encoding", options: STR_DECODE_ENCODING_OPTIONS, getValue: (c) => c.editValues.encoding || "utf-8", onChange: (v, c) => c.handleFieldChange("encoding", v) },
        strictSwitch(),
    ],
    dt_strftime: [
        { kind: "text", key: "format", label: "Format", placeholder: "e.g. %Y-%m-%d", getValue: (c) => c.editValues.format || "%Y-%m-%d", onChange: (v, c) => c.handleFieldChange("format", v) },
    ],
    dt_timestamp: [timeUnitField()],
    dt_epoch: [timeUnitField()],
    dt_truncate: dtTruncateFields(),
    dt_round: dtTruncateFields(),
    dt_offset_by: [
        { kind: "text", key: "by", label: "By", placeholder: "e.g. 1d, 1h, -2h", getValue: (c) => c.editValues.by || "1d", onChange: (v, c) => c.handleFieldChange("by", v) },
    ],
    arr_get: [
        { kind: "text", key: "index", label: "Index", placeholder: "e.g. 0", getValue: (c) => c.editValues.index !== undefined ? String(c.editValues.index) : "0", onChange: (v, c) => c.handleFieldChange("index", numberField(v, 0)) },
        { kind: "switch", key: "null_on_oob", label: "Null on Out of Bounds", getValue: (c) => !!c.editValues.null_on_oob, onChange: (v, c) => c.handleFieldChange("null_on_oob", v) },
    ],
    arr_join: [
        { kind: "text", key: "separator", label: "Separator", placeholder: "e.g. ,", getValue: (c) => c.editValues.separator || ",", onChange: (v, c) => c.handleFieldChange("separator", v) },
        { kind: "switch", key: "ignore_nulls", label: "Ignore Nulls", getValue: (c) => !!c.editValues.ignore_nulls, onChange: (v, c) => c.handleFieldChange("ignore_nulls", v) },
    ],
    arr_sort: [
        { kind: "switch", key: "descending", label: "Descending", getValue: (c) => !!c.editValues.descending, onChange: (v, c) => c.handleFieldChange("descending", v) },
        { kind: "switch", key: "nulls_last", label: "Nulls Last", getValue: (c) => !!c.editValues.nulls_last, onChange: (v, c) => c.handleFieldChange("nulls_last", v) },
    ],
    arr_unique: [
        { kind: "switch", key: "maintain_order", label: "Maintain Order", getValue: (c) => !!c.editValues.maintain_order, onChange: (v, c) => c.handleFieldChange("maintain_order", v) },
    ],
    arr_shift: [nField("1")],
    arr_slice: [
        { kind: "text", key: "offset", label: "Offset", placeholder: "e.g. 0", getValue: (c) => c.editValues.offset !== undefined ? String(c.editValues.offset) : "0", onChange: (v, c) => c.handleFieldChange("offset", numberField(v, 0)) },
        { kind: "text", key: "length", label: "Length", placeholder: "e.g. 5 (optional)", getValue: (c) => c.editValues.length !== undefined && c.editValues.length !== null ? String(c.editValues.length) : "", onChange: (v, c) => c.handleFieldChange("length", nullableNumber(v)) },
    ],
    arr_to_struct: [
        { kind: "list", key: "fields", label: "Fields (optional)", getValue: (c) => c.editValues.fields || "[]", onChange: (v, c) => c.handleFieldChange("fields", v === "[]" ? null : v), placeholder: "Enter a field name..." },
        { kind: "text", key: "upper_bound", label: "Upper Bound", placeholder: "e.g. 10 (optional)", getValue: (c) => c.editValues.upper_bound !== undefined && c.editValues.upper_bound !== null ? String(c.editValues.upper_bound) : "", onChange: (v, c) => c.handleFieldChange("upper_bound", nullableNumber(v)) },
    ],
    struct_field: [
        { kind: "text", key: "name", label: "Field Name", placeholder: "e.g. field_name", getValue: (c) => c.editValues.name || "", onChange: (v, c) => c.handleFieldChange("name", v) },
    ],
    struct_rename_fields: [
        { kind: "list", key: "names", label: "Names", getValue: (c) => c.editValues.names || "[]", onChange: (v, c) => c.handleFieldChange("names", v), placeholder: "Enter a field name..." },
    ],
    chain: chainForm,
    fit: fitForm,
    bokeh_scatter: [
        { kind: "select", key: "x", label: "X Column", options: (c) => c.columnOptions, getValue: (c) => c.editValues.x || "", onChange: (v, c) => c.handleFieldChange("x", v) },
        { kind: "select", key: "y", label: "Y Column", options: (c) => c.columnOptions, getValue: (c) => c.editValues.y || "", onChange: (v, c) => c.handleFieldChange("y", v) },
        { kind: "select", key: "color", label: "Color Column (Optional)", options: (c) => ["", ...c.columnOptions], getValue: (c) => c.editValues.color || "", onChange: (v, c) => c.handleFieldChange("color", v === "" ? null : v) },
        titleField(),
    ],
    bokeh_line: [
        { kind: "select", key: "x", label: "X Column", options: (c) => c.columnOptions, getValue: (c) => c.editValues.x || "", onChange: (v, c) => c.handleFieldChange("x", v) },
        { kind: "select", key: "y", label: "Y Column", options: (c) => c.columnOptions, getValue: (c) => c.editValues.y || "", onChange: (v, c) => c.handleFieldChange("y", v) },
        titleField(),
    ],
    bokeh_pie: [
        { kind: "select", key: "labels", label: "Labels Column", options: (c) => c.columnOptions, getValue: (c) => c.editValues.labels || "", onChange: (v, c) => c.handleFieldChange("labels", v) },
        { kind: "select", key: "values", label: "Values Column", options: (c) => c.columnOptions, getValue: (c) => c.editValues.values || "", onChange: (v, c) => c.handleFieldChange("values", v) },
        titleField(),
    ],
    bokeh_histogram: [
        { kind: "select", key: "column", label: "Column", options: (c) => c.columnOptions, getValue: (c) => c.editValues.column || "", onChange: (v, c) => c.handleFieldChange("column", v) },
        { kind: "text", key: "bins", label: "Bins", placeholder: "e.g. 10", getValue: (c) => c.editValues.bins !== undefined ? String(c.editValues.bins) : "10", onChange: (v, c) => c.handleFieldChange("bins", numberField(v, 10)) },
        titleField(),
    ],
    branch: [
        { kind: "select", key: "condition", label: "Condition", options: ["has_column", "has_all_columns", "has_any_column", "column_dtype", "min_columns"], getValue: (c) => c.editValues.condition || "has_column", onChange: (v, c) => c.handleFieldChange("condition", v) },
        { kind: "select", key: "column", label: "Column", options: (c) => c.columnOptions, when: (c) => ["has_column", "column_dtype"].includes(c.editValues.condition || "has_column"), getValue: (c) => c.editValues.column || "", onChange: (v, c) => c.handleFieldChange("column", v) },
        { kind: "multiselect", key: "columns", label: "Columns", options: (c) => c.availableColumns, when: (c) => ["has_all_columns", "has_any_column"].includes(c.editValues.condition), getValue: (c) => Array.isArray(c.editValues.columns) ? c.editValues.columns : [], onChange: (v, c) => c.handleFieldChange("columns", v) },
        { kind: "text", key: "dtype", label: "Dtype", placeholder: "e.g. Int64", when: (c) => c.editValues.condition === "column_dtype", getValue: (c) => c.editValues.dtype || "", onChange: (v, c) => c.handleFieldChange("dtype", v) },
        { kind: "text", key: "n", label: "Minimum columns", placeholder: "e.g. 2", when: (c) => c.editValues.condition === "min_columns", getValue: (c) => c.editValues.n !== undefined ? String(c.editValues.n) : "1", onChange: (v, c) => c.handleFieldChange("n", numberField(v, 1)) },
    ],
    series_alias: [nameField("Series Name", "e.g. importe")],
    // The right operand is optional: wire a Series to the `right` handle,
    // or leave it unwired and this value is used instead.
    series_compare: [
        { kind: "select", key: "op", label: "Operator", options: ["==", "!=", ">", ">=", "<", "<="], getValue: (c) => c.editValues.op || ">", onChange: (v, c) => c.handleFieldChange("op", v) },
        { kind: "text", key: "value", label: "Value (if no 'right' connected)", placeholder: "e.g. 100", getValue: (c) => c.editValues.value === undefined || c.editValues.value === null ? "" : String(c.editValues.value), onChange: (v, c) => c.handleFieldChange("value", v.trim() === "" ? null : (Number.isNaN(Number(v)) ? v : Number(v))) },
    ],
    series_arith: [
        { kind: "select", key: "op", label: "Operator", options: ["+", "-", "*", "/", "//", "%", "**"], getValue: (c) => c.editValues.op || "+", onChange: (v, c) => c.handleFieldChange("op", v) },
        { kind: "text", key: "value", label: "Value (if no 'right' connected)", placeholder: "e.g. 2", getValue: (c) => c.editValues.value === undefined || c.editValues.value === null ? "" : String(c.editValues.value), onChange: (v, c) => c.handleFieldChange("value", v.trim() === "" ? null : (Number.isNaN(Number(v)) ? v : Number(v))) },
    ],
    bokeh_confusion_matrix: [
        { kind: "select", key: "y_true", label: "True Column", options: (c) => c.columnOptions, getValue: (c) => c.editValues.y_true || "", onChange: (v, c) => c.handleFieldChange("y_true", v) },
        { kind: "select", key: "y_pred", label: "Predicted Column", options: (c) => c.columnOptions, getValue: (c) => c.editValues.y_pred || "", onChange: (v, c) => c.handleFieldChange("y_pred", v) },
        titleField(),
    ],
};

for (const t of WRITE_FILE_TYPES) NODE_FORM_SCHEMAS[t] = writeFileForm;
for (const t of MULTI_ML_TYPES) NODE_FORM_SCHEMAS[t] = mlNodeForm;

// ──────────────────────────────────────────────────────────────────
// Small field-spec factories for shapes repeated across many node types
// ──────────────────────────────────────────────────────────────────

function nameField(label: string, placeholder: string): FieldSpec {
    return { kind: "text", key: "name", label, placeholder, getValue: (c) => c.editValues.name || "", onChange: (v, c) => c.handleFieldChange("name", v) };
}

function nRowsField(): FieldSpec {
    return { kind: "text", key: "n", label: "Number of Rows (N)", placeholder: "e.g. 5", getValue: (c) => stringOrUndefined(c.editValues.n), onChange: (v, c) => c.handleFieldChange("n", v) };
}

function nField(fallback: string): FieldSpec {
    return { kind: "text", key: "n", label: "N", placeholder: "e.g. 1", getValue: (c) => c.editValues.n !== undefined ? String(c.editValues.n) : fallback, onChange: (v, c) => c.handleFieldChange("n", numberField(v, Number(fallback))) };
}

function ddofField(): FieldSpec {
    return { kind: "text", key: "ddof", label: "Delta Degrees of Freedom (ddof)", placeholder: "e.g. 1", getValue: (c) => c.editValues.ddof !== undefined ? String(c.editValues.ddof) : "1", onChange: (v, c) => c.handleFieldChange("ddof", numberField(v, 1)) };
}

function reverseField(): FieldSpec {
    return { kind: "switch", key: "reverse", label: "Reverse", getValue: (c) => !!c.editValues.reverse, onChange: (v, c) => c.handleFieldChange("reverse", v) };
}

function seedField(): FieldSpec {
    return { kind: "text", key: "seed", label: "Seed", placeholder: "e.g. 42 (optional)", getValue: (c) => c.editValues.seed !== undefined && c.editValues.seed !== null ? String(c.editValues.seed) : "", onChange: (v, c) => c.handleFieldChange("seed", nullableNumber(v)) };
}

function indicesField(): FieldSpec {
    return { kind: "list", key: "indices", label: "Indices", getValue: (c) => c.editValues.indices || "[]", onChange: (v, c) => c.handleFieldChange("indices", v), placeholder: "Enter an index..." };
}

function nullableLabelsField(): FieldSpec {
    return { kind: "list", key: "labels", label: "Labels (optional)", getValue: (c) => c.editValues.labels || "[]", onChange: (v, c) => c.handleFieldChange("labels", v === "[]" ? null : v), placeholder: "Enter a label..." };
}

function leftClosedField(): FieldSpec {
    return { kind: "switch", key: "left_closed", label: "Left Closed", getValue: (c) => !!c.editValues.left_closed, onChange: (v, c) => c.handleFieldChange("left_closed", v) };
}

function patternField(): FieldSpec {
    return { kind: "text", key: "pattern", label: "Pattern", placeholder: "e.g. Widget", getValue: (c) => c.editValues.pattern || "", onChange: (v, c) => c.handleFieldChange("pattern", v) };
}

function valueField(): FieldSpec {
    return { kind: "text", key: "value", label: "Value", placeholder: "e.g. bar", getValue: (c) => c.editValues.value || "", onChange: (v, c) => c.handleFieldChange("value", v) };
}

function strictSwitch(): FieldSpec {
    return { kind: "switch", key: "strict", label: "Strict", getValue: (c) => c.editValues.strict !== false, onChange: (v, c) => c.handleFieldChange("strict", v) };
}

function timeUnitField(): FieldSpec {
    return { kind: "select", key: "time_unit", label: "Time Unit", options: TIME_UNIT_OPTIONS, getValue: (c) => c.editValues.time_unit || "us", onChange: (v, c) => c.handleFieldChange("time_unit", v) };
}

function titleField(): FieldSpec {
    return { kind: "text", key: "title", label: "Title", placeholder: "e.g. My Chart", getValue: (c) => c.editValues.title || "", onChange: (v, c) => c.handleFieldChange("title", v) };
}

function strJustFields(): FieldSpec[] {
    return [
        { kind: "text", key: "length", label: "Length", placeholder: "e.g. 10", getValue: (c) => c.editValues.length !== undefined ? String(c.editValues.length) : "1", onChange: (v, c) => c.handleFieldChange("length", numberField(v, 1)) },
        { kind: "text", key: "fill_char", label: "Fill Character", placeholder: "e.g. space", when: (c) => c.type === "str_ljust" || c.type === "str_rjust", getValue: (c) => c.editValues.fill_char || " ", onChange: (v, c) => c.handleFieldChange("fill_char", v) },
    ];
}

function dtTruncateFields(): FieldSpec[] {
    return [
        { kind: "text", key: "every", label: "Every", placeholder: "e.g. 1d, 1h, 15m", getValue: (c) => c.editValues.every || "1d", onChange: (v, c) => c.handleFieldChange("every", v) },
        { kind: "text", key: "offset", label: "Offset", placeholder: "e.g. 1h (optional)", getValue: (c) => c.editValues.offset !== undefined && c.editValues.offset !== null ? String(c.editValues.offset) : "", onChange: (v, c) => c.handleFieldChange("offset", v === "" ? null : v) },
    ];
}

function ewmFields(): FieldSpec[] {
    return [
        { kind: "text", key: "alpha", label: "Alpha", placeholder: "e.g. 0.5", getValue: (c) => c.editValues.alpha !== undefined ? String(c.editValues.alpha) : "0.5", onChange: (v, c) => c.handleFieldChange("alpha", numberField(v, 0.5)) },
        { kind: "switch", key: "adjust", label: "Adjust", getValue: (c) => c.editValues.adjust !== false, onChange: (v, c) => c.handleFieldChange("adjust", v) },
        { kind: "text", key: "min_periods", label: "Min Periods", placeholder: "e.g. 1", getValue: (c) => c.editValues.min_periods !== undefined ? String(c.editValues.min_periods) : "1", onChange: (v, c) => c.handleFieldChange("min_periods", numberField(v, 1)) },
        { kind: "switch", key: "ignore_nulls", label: "Ignore Nulls", getValue: (c) => c.editValues.ignore_nulls !== false, onChange: (v, c) => c.handleFieldChange("ignore_nulls", v) },
        { kind: "switch", key: "bias", label: "Bias", when: (c) => c.type === "ewm_std" || c.type === "ewm_var", getValue: (c) => !!c.editValues.bias, onChange: (v, c) => c.handleFieldChange("bias", v) },
    ];
}

function rollingFields(): FieldSpec[] {
    return [
        { kind: "text", key: "window_size", label: "Window Size", placeholder: "e.g. 3", getValue: (c) => c.editValues.window_size !== undefined ? String(c.editValues.window_size) : "3", onChange: (v, c) => c.handleFieldChange("window_size", numberField(v, 3)) },
        { kind: "text", key: "min_periods", label: "Min Periods", placeholder: "e.g. 1", getValue: (c) => c.editValues.min_periods !== undefined ? String(c.editValues.min_periods) : "1", onChange: (v, c) => c.handleFieldChange("min_periods", numberField(v, 1)) },
        { kind: "switch", key: "center", label: "Center", getValue: (c) => !!c.editValues.center, onChange: (v, c) => c.handleFieldChange("center", v) },
        { kind: "select", key: "closed", label: "Closed", options: ROLLING_CLOSED_OPTIONS, getValue: (c) => c.editValues.closed || "right", onChange: (v, c) => c.handleFieldChange("closed", v) },
        { kind: "text", key: "ddof", label: "Delta Degrees of Freedom (ddof)", placeholder: "e.g. 1", when: (c) => c.type === "rolling_std" || c.type === "rolling_var", getValue: (c) => c.editValues.ddof !== undefined ? String(c.editValues.ddof) : "1", onChange: (v, c) => c.handleFieldChange("ddof", numberField(v, 1)) },
    ];
}
