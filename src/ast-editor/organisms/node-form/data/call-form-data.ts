/** Method choices offered by CallForm's "Method" select. */
export const COMMON_CALL_METHODS = [
    "", "sum", "mean", "min", "max", "count", "first", "last",
    "std", "var", "median", "n_unique", "null_count",
    "str.contains", "str.starts_with", "str.ends_with",
    "str.to_lowercase", "str.to_uppercase", "str.strip_chars",
    "str.replace", "str.replace_all", "str.slice", "str.len_chars",
    "str.extract", "str.count_matches", "str.split",
    "dt.year", "dt.month", "dt.day", "dt.hour",
    "dt.minute", "dt.second", "dt.weekday",
    "is_null", "is_not_null", "is_nan", "is_not_nan",
    "abs", "round", "ceil", "floor", "sqrt", "log",
    "cumsum", "cumprod", "cummin", "cummax",
    "diff", "shift", "forward_fill", "backward_fill",
];

/** Which arg key holds a call method's pattern/substring argument. */
export const CALL_PATTERN_FIELDS: Record<string, string> = {
    "str.contains": "pattern",
    "str.starts_with": "sub",
    "str.ends_with": "sub",
    "str.replace": "pattern",
    "str.replace_all": "pattern",
    "str.extract": "pattern",
    "str.count_matches": "pattern",
};
