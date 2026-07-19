/**
 * Canonical "friendly label for a node type" function — single source
 * of truth for what used to be two independently-maintained ~250-line
 * switches: `getLabel(step)` in `ast_to_flow.ts` (used when a pipeline
 * is loaded onto the canvas) and `getDynamicLabel(nodeType, properties)`
 * in `AstCanvas.tsx` (used when a node's properties are edited via
 * NodePanel). They had already drifted: `AstCanvas.tsx`'s copy had a
 * `chain` case the other didn't, so a `chain` node loaded from JSON
 * showed the raw type string instead of "Chain (AND) · N" until its
 * properties were edited once. This version is the union of both,
 * exported for both call sites.
 *
 * Both original switches ALSO independently accumulated the same 8
 * masked-duplicate `case` labels (a JS `switch` takes the first
 * matching label, so a second `case "sort":` etc. later in the same
 * switch is unreachable dead code) — `sort`, `fill_null`, `fill_nan`,
 * `drop_nulls`, `unique`, `shift`, `sample`, `rechunk` each appeared
 * once for a DataFrame-step shape and again, unreachably, for a Series
 * expression shape. This version keeps only the reachable (first)
 * case for each, preserving today's real behavior instead of silently
 * changing it — same resolution used for the equivalent bug in
 * `NodePanel.tsx`'s node-type switch.
 */
export function getNodeLabel(nodeType: string, properties: Record<string, any>): string {
    switch (nodeType) {
        case "col": return `Col(${properties.name || ""})`;
        case "lit": return `Lit(${JSON.stringify(properties.value ?? "")})`;
        case "binary": return `BinaryOp(${properties.op || ""})`;
        case "unary": return `UnaryOp(${properties.op || ""})`;
        case "call": return `Call.${properties.method || ""}()`;
        case "alias": return `Alias("${properties.name || ""}")`;
        case "chain": {
            const op = properties.op === "&" ? "AND" : "OR";
            const count = (properties._operand_count as number) ?? 0;
            return `Chain (${op}) · ${count}`;
        }
        case "when": return "When/Then";
        case "cast": return `Cast(${properties.dtype || ""})`;
        case "over": return "Over";
        case "sort_expr": return "SortExpr";
        case "scan": return "Scan";
        case "select": return "Select";
        case "with_columns": return "WithColumns";
        case "filter": return "Filter";
        case "group_by": return `GroupBy(${JSON.stringify(properties.by || [])})`;
        case "sort": return `Sort(${JSON.stringify(properties.by || [])})`;
        case "join": return `Join(${properties.how || "inner"})`;
        case "join_asof": return `JoinAsof`;
        case "cross_join": return "CrossJoin";
        case "head": return `Head(${properties.n || 5})`;
        case "tail": return `Tail(${properties.n || 5})`;
        case "slice": return `Slice(${properties.offset || 0}, ${properties.length || 10})`;
        case "rename": return "Rename";
        case "drop": return "Drop";
        case "drop_nulls": return "DropNulls";
        case "fill_null": return "FillNull";
        case "fill_nan": return "FillNaN";
        case "unique": return "Unique";
        case "explode": return "Explode";
        case "unnest": return "Unnest";
        case "unpivot": return "Unpivot";
        case "transpose": return "Transpose";
        case "vstack": return "VStack";
        case "hstack": return "HStack";
        case "sample": return "Sample";
        case "with_row_index": return "RowIndex";
        case "shift": return `Shift(${properties.n || 1})`;
        case "collect": return "Collect";
        case "write_csv": return properties.path ? `Write CSV (${properties.path.split(/[\\/]/).pop()})` : "Write CSV";
        case "write_excel": return properties.path ? `Write Excel (${properties.path.split(/[\\/]/).pop()})` : "Write Excel";
        case "write_html": return properties.path ? `Write HTML (${properties.path.split(/[\\/]/).pop()})` : "Write HTML";
        case "describe": return "Describe";
        case "rechunk": return "Rechunk";
        // ─── Bokeh Visualizations ─────────────────────────────────────────
        case "bokeh_scatter": return properties.x && properties.y ? `Scatter (${properties.x} vs ${properties.y}${properties.color ? ` color=${properties.color}` : ""})` : "Scatter Plot";
        case "bokeh_line": return properties.x && properties.y ? `Line (${properties.x} vs ${properties.y})` : "Line Chart";
        case "bokeh_pie": return properties.labels && properties.values ? `Pie (${properties.labels}, ${properties.values})` : "Pie Chart";
        case "bokeh_histogram": return properties.column ? `Histogram (${properties.column})` : "Histogram";
        case "bokeh_confusion_matrix": return properties.y_true && properties.y_pred ? `Confusion (${properties.y_true} vs ${properties.y_pred})` : "Confusion Matrix";

        case "extract_series_chain": return `ExtractSeriesChain("${properties.name || ""}")`;
        // ─── Series AST nodes ─────────────────────────────────────────
        // Roots
        case "get_column": return `GetColumn(${properties.name || ""})`;
        case "from_list": return `FromList(${properties.values?.length || 0} items)`;
        case "from_scalar": return `FromScalar(${JSON.stringify(properties.value ?? "")})`;
        // Numeric
        case "abs": return "Abs";
        case "sign": return "Sign";
        case "negate": return "Negate";
        case "sqrt": return "Sqrt";
        case "exp": return "Exp";
        case "log": return `Log(base=${properties.base ?? "e"})`;
        case "log1p": return "Log1p";
        case "floor": return "Floor";
        case "ceil": return "Ceil";
        case "round": return `Round(${properties.decimals ?? 0})`;
        case "pow": return `Pow(${properties.exponent ?? 2})`;
        case "clip": return `Clip(${properties.min_bound ?? "-∞"}, ${properties.max_bound ?? "∞"})`;
        // Null predicates
        case "is_null": return "IsNull";
        case "is_not_null": return "IsNotNull";
        case "is_nan": return "IsNaN";
        case "is_finite": return "IsFinite";
        case "is_infinite": return "IsInfinite";
        case "is_unique": return "IsUnique";
        case "is_duplicated": return "IsDuplicated";
        // Aggregations
        case "sum": return "Sum";
        case "min": return "Min";
        case "max": return "Max";
        case "mean": return "Mean";
        case "median": return "Median";
        case "count": return "Count";
        case "n_unique": return "NUnique";
        case "first": return "First";
        case "last": return "Last";
        case "mode": return "Mode";
        case "value_counts": return "ValueCounts";
        case "null_count": return "NullCount";
        // Statistics
        case "std": return `Std(ddof=${properties.ddof ?? 1})`;
        case "var": return `Var(ddof=${properties.ddof ?? 1})`;
        case "quantile": return `Quantile(${properties.quantile ?? 0.5})`;
        case "skew": return "Skew";
        case "kurtosis": return "Kurtosis";
        case "entropy": return `Entropy(base=${properties.base ?? 2})`;
        // Null handling
        case "drop_nans": return "DropNans";
        case "interpolate": return `Interpolate(${properties.method ?? "linear"})`;
        // Sorting
        case "arg_sort": return `ArgSort(${properties.descending ? "desc" : "asc"})`;
        case "arg_min": return "ArgMin";
        case "arg_max": return "ArgMax";
        case "arg_unique": return "ArgUnique";
        case "arg_true": return "ArgTrue";
        case "reverse": return "Reverse";
        // Set membership
        case "is_in": return `IsIn(${properties.values?.length ?? 0} values)`;
        case "is_between": return `IsBetween(${properties.lower ?? "?"}, ${properties.upper ?? "?"})`;
        // Window
        case "diff": return `Diff(${properties.n ?? 1})`;
        case "pct_change": return `PctChange(${properties.n ?? 1})`;
        case "ewm_mean": return `EwmMean(α=${properties.alpha ?? 0.5})`;
        case "ewm_std": return `EwmStd(α=${properties.alpha ?? 0.5})`;
        case "ewm_var": return `EwmVar(α=${properties.alpha ?? 0.5})`;
        case "rolling_mean": return `RollingMean(${properties.window_size ?? 3})`;
        case "rolling_sum": return `RollingSum(${properties.window_size ?? 3})`;
        case "rolling_min": return `RollingMin(${properties.window_size ?? 3})`;
        case "rolling_max": return `RollingMax(${properties.window_size ?? 3})`;
        case "rolling_std": return `RollingStd(${properties.window_size ?? 3})`;
        case "rolling_var": return `RollingVar(${properties.window_size ?? 3})`;
        case "cum_sum": return "CumSum";
        case "cum_prod": return "CumProd";
        case "cum_min": return "CumMin";
        case "cum_max": return "CumMax";
        case "cum_count": return "CumCount";
        // Sampling
        case "shuffle": return "Shuffle";
        case "gather": return `Gather(${properties.indices?.length ?? 0} indices)`;
        case "take": return `Take(${properties.indices?.length ?? 0} indices)`;
        case "gather_every": return `GatherEvery(${properties.n ?? 2})`;
        // Encoding
        case "to_dummies": return "ToDummies";
        case "cut": return `Cut(${properties.breaks?.length ?? 0} breaks)`;
        case "qcut": return `QCut(${properties.quantiles?.length ?? 0} quantiles)`;
        case "rle": return "RLE";
        case "rle_id": return "RLE_ID";
        // Misc
        case "hash": return "Hash";
        case "append": return "Append";
        case "lower_bound": return "LowerBound";
        case "upper_bound": return "UpperBound";
        case "peak_min": return "PeakMin";
        case "peak_max": return "PeakMax";
        case "rank": return `Rank(${properties.method ?? "average"})`;
        // Strings
        case "str_contains": return `StrContains("${properties.pattern ?? ""}")`;
        case "str_starts_with": return `StrStartsWith("${properties.prefix ?? ""}")`;
        case "str_ends_with": return `StrEndsWith("${properties.suffix ?? ""}")`;
        case "str_strip": return "StrStrip";
        case "str_lstrip": return "StrLStrip";
        case "str_rstrip": return "StrRStrip";
        case "str_to_uppercase": return "StrUppercase";
        case "str_to_lowercase": return "StrLowercase";
        case "str_replace": return `StrReplace("${properties.pattern ?? ""}")`;
        case "str_replace_all": return `StrReplaceAll("${properties.pattern ?? ""}")`;
        case "str_slice": return `StrSlice(${properties.offset ?? 0}, ${properties.length ?? "?"})`;
        case "str_split": return `StrSplit("${properties.by ?? ","}")`;
        case "str_zfill": return `StrZFill(${properties.length ?? 1})`;
        case "str_ljust": return `StrLJust(${properties.length ?? 1})`;
        case "str_rjust": return `StrRJust(${properties.length ?? 1})`;
        case "str_count_matches": return `StrCountMatches("${properties.pattern ?? ""}")`;
        case "str_extract": return `StrExtract("${properties.pattern ?? ""}")`;
        case "str_extract_all": return `StrExtractAll("${properties.pattern ?? ""}")`;
        case "str_json_extract": return "StrJsonExtract";
        case "str_lengths": return "StrLengths";
        case "str_n_chars": return "StrNChars";
        case "str_len_bytes": return "StrLenBytes";
        case "str_strptime": return `StrStrptime(${properties.dtype ?? "Date"})`;
        case "str_decode": return `StrDecode(${properties.encoding ?? "utf-8"})`;
        // Datetime
        case "dt_year": return "DtYear";
        case "dt_month": return "DtMonth";
        case "dt_day": return "DtDay";
        case "dt_hour": return "DtHour";
        case "dt_minute": return "DtMinute";
        case "dt_second": return "DtSecond";
        case "dt_millisecond": return "DtMillisecond";
        case "dt_microsecond": return "DtMicrosecond";
        case "dt_nanosecond": return "DtNanosecond";
        case "dt_weekday": return "DtWeekday";
        case "dt_week": return "DtWeek";
        case "dt_ordinal_day": return "DtOrdinalDay";
        case "dt_total_days": return "DtTotalDays";
        case "dt_total_seconds": return "DtTotalSeconds";
        case "dt_total_minutes": return "DtTotalMinutes";
        case "dt_total_hours": return "DtTotalHours";
        case "dt_total_milliseconds": return "DtTotalMilliseconds";
        case "dt_total_microseconds": return "DtTotalMicroseconds";
        case "dt_total_nanoseconds": return "DtTotalNanoseconds";
        case "dt_strftime": return `DtStrftime("${properties.format ?? "%Y-%m-%d"}")`;
        case "dt_timestamp": return `DtTimestamp(${properties.time_unit ?? "us"})`;
        case "dt_epoch": return `DtEpoch(${properties.time_unit ?? "us"})`;
        case "dt_truncate": return `DtTruncate("${properties.every ?? "1d"}")`;
        case "dt_round": return `DtRound("${properties.every ?? "1d"}")`;
        case "dt_offset_by": return `DtOffsetBy("${properties.by ?? "1d"}")`;
        case "dt_combine": return "DtCombine";
        case "dt_is_leap_year": return "DtIsLeapYear";
        case "dt_days_in_month": return "DtDaysInMonth";
        case "dt_quarter": return "DtQuarter";
        // Lists
        case "arr_sum": return "ArrSum";
        case "arr_min": return "ArrMin";
        case "arr_max": return "ArrMax";
        case "arr_mean": return "ArrMean";
        case "arr_sort": return `ArrSort(${properties.descending ? "desc" : "asc"})`;
        case "arr_reverse": return "ArrReverse";
        case "arr_unique": return "ArrUnique";
        case "arr_get": return `ArrGet(${properties.index ?? 0})`;
        case "arr_first": return "ArrFirst";
        case "arr_last": return "ArrLast";
        case "arr_contains": return "ArrContains";
        case "arr_join": return `ArrJoin("${properties.separator ?? ","}")`;
        case "arr_lengths": return "ArrLengths";
        case "arr_explode": return "ArrExplode";
        case "arr_flatten": return "ArrFlatten";
        case "arr_arg_min": return "ArrArgMin";
        case "arr_arg_max": return "ArrArgMax";
        case "arr_shift": return `ArrShift(${properties.n ?? 1})`;
        case "arr_slice": return `ArrSlice(${properties.offset ?? 0}, ${properties.length ?? "?"})`;
        case "arr_to_struct": return "ArrToStruct";
        // Structs
        case "struct_field": return `StructField("${properties.name ?? ""}")`;
        case "struct_rename_fields": return "StructRenameFields";
        case "struct_unnest": return "StructUnnest";
        case "struct_json_encode": return "StructJsonEncode";
        // Bitwise
        case "bitwise_and": return "BitwiseAnd";
        case "bitwise_or": return "BitwiseOr";
        case "bitwise_xor": return "BitwiseXor";
        default: return nodeType;
    }
}
