/**
 * Canonical set of Series AST node type identifiers (as opposed to
 * DataFrame AST expression types like `col`/`lit`/`binary`).
 *
 * Single source of truth for a list that used to be declared
 * independently in both `ast_to_flow.ts` (as part of `EXPR_TYPES`) and
 * `flow_to_ast.ts` (`isSeriesNode`'s local `seriesNodeTypes`) — the two
 * had already drifted to letter-for-letter duplicates with no compiler
 * check tying them together. Adding a new Series node type now means
 * updating this one array instead of two.
 */
export const SERIES_NODE_TYPES: ReadonlySet<string> = new Set([
    // Roots
    "get_column", "from_list", "from_scalar",
    // Numeric
    "abs", "sign", "negate", "sqrt", "exp", "log", "log1p", "floor", "ceil", "round", "pow", "clip",
    // Null predicates
    "is_null", "is_not_null", "is_nan", "is_finite", "is_infinite", "is_unique", "is_duplicated",
    // Aggregations
    "sum", "min", "max", "mean", "median", "count", "n_unique", "first", "last", "mode", "value_counts", "null_count",
    // Statistics
    "std", "var", "quantile", "skew", "kurtosis", "entropy",
    // Null handling
    "fill_null", "fill_nan", "drop_nulls", "drop_nans", "interpolate",
    // Sorting
    "sort", "arg_sort", "arg_min", "arg_max", "arg_unique", "arg_true", "reverse",
    // Set membership
    "is_in", "is_between", "unique",
    // Window
    "shift", "diff", "pct_change",
    "ewm_mean", "ewm_std", "ewm_var",
    "rolling_mean", "rolling_sum", "rolling_min", "rolling_max", "rolling_std", "rolling_var",
    "cum_sum", "cum_prod", "cum_min", "cum_max", "cum_count",
    // Sampling
    "sample", "shuffle", "gather", "take", "gather_every",
    // Encoding
    "to_dummies", "cut", "qcut", "rle", "rle_id",
    // Misc
    "hash", "rechunk", "append", "lower_bound", "upper_bound", "peak_min", "peak_max", "rank",
    // Strings
    "str_contains", "str_starts_with", "str_ends_with",
    "str_strip", "str_lstrip", "str_rstrip",
    "str_to_uppercase", "str_to_lowercase",
    "str_replace", "str_replace_all", "str_slice", "str_split",
    "str_zfill", "str_ljust", "str_rjust",
    "str_count_matches", "str_extract", "str_extract_all",
    "str_json_extract", "str_lengths", "str_n_chars", "str_len_bytes",
    "str_strptime", "str_decode",
    // Datetime
    "dt_year", "dt_month", "dt_day",
    "dt_hour", "dt_minute", "dt_second",
    "dt_millisecond", "dt_microsecond", "dt_nanosecond",
    "dt_weekday", "dt_week", "dt_ordinal_day",
    "dt_total_days", "dt_total_seconds", "dt_total_minutes",
    "dt_total_hours", "dt_total_milliseconds", "dt_total_microseconds", "dt_total_nanoseconds",
    "dt_strftime", "dt_timestamp", "dt_epoch",
    "dt_truncate", "dt_round", "dt_offset_by",
    "dt_combine", "dt_is_leap_year", "dt_days_in_month", "dt_quarter",
    // Lists
    "arr_sum", "arr_min", "arr_max", "arr_mean",
    "arr_sort", "arr_reverse", "arr_unique", "arr_get",
    "arr_first", "arr_last", "arr_contains", "arr_join",
    "arr_lengths", "arr_explode", "arr_flatten",
    "arr_arg_min", "arr_arg_max", "arr_shift", "arr_slice", "arr_to_struct",
    // Structs
    "struct_field", "struct_rename_fields", "struct_unnest", "struct_json_encode",
    // Bitwise
    "bitwise_and", "bitwise_or", "bitwise_xor",
]);

/**
 * DF-level expression node types (as opposed to Series AST types) — the
 * subset of the full expression-node universe that never carries a
 * "df_source"/chain meaning. Used to tell a flat graph node's "input"
 * reference apart: DF -> DF (source), Series -> Series
 * (chain-continuation), or DF -> Series (get_column's df_source bridge).
 */
export const DF_EXPR_ONLY_TYPES: ReadonlySet<string> = new Set([
    "col", "lit", "binary", "unary", "call", "alias", "when", "cast", "over", "sort_expr",
]);
