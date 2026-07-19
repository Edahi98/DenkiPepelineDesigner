import type { ElementType } from "react";
import {
    Columns3, Hash, GitBranch, Minus, Tag, HelpCircle,
    ArrowRightLeft, Layers, ArrowUpDown, Database, TableProperties,
    Filter, Group, Merge, Scissors, ChevronsUp, ChevronsDown,
    PenLine, Trash2, XCircle, PlusCircle, Fingerprint,
    RefreshCw, FunctionSquare, Link2, FileText,
    // Machine Learning icons
    Brain, Network, ScatterChart, PieChart, LineChart, BarChart, Type, Target, Maximize,
    // Series AST icons
    Zap, List, Calculator, Sigma, TrendingUp, CircleOff,
    CheckCircle, Percent, TrendingDown, MousePointer, Grid3x3,
    Repeat, Plus, ArrowDown, ArrowUp, Award, Calendar, Clock,
    Box, Ampersand, Shuffle
} from "lucide-react";

export const ICON_MAP: Record<string, ElementType> = {
    // DataFrame AST icons
    col: Columns3, lit: Hash, binary: GitBranch, unary: Minus, alias: Tag, when: HelpCircle,
    cast: ArrowRightLeft, over: Layers, sort_expr: ArrowUpDown, scan: Database, file_reader: FileText, select: TableProperties, chain: Link2,
    with_columns: Columns3, filter: Filter, group_by: Group, sort: ArrowUpDown, join: Merge,
    join_asof: Merge, cross_join: Merge, slice: Scissors, head: ChevronsUp, tail: ChevronsDown,
    rename: PenLine, drop: Trash2, drop_nulls: XCircle, fill_null: PlusCircle, unique: Fingerprint,
    call: FunctionSquare,
    // Bokeh Visualizations
    bokeh_scatter: ScatterChart, bokeh_line: LineChart, bokeh_pie: PieChart, bokeh_histogram: BarChart,
    // Machine Learning icons
    logistic_regression: Brain, svc: Network, multinomial_nb: Brain, sgd_classifier: Brain,
    kmeans: Target, dbscan: Target, agglomerative_clustering: Target,
    truncated_svd: Maximize, lda: Maximize, nmf: Maximize,
    tfidf_vectorizer: Type, count_vectorizer: Type, hashing_vectorizer: Hash,
    fit: Database,
    // Custom Types AST roots
    get_column: Zap, from_list: List, from_scalar: Hash,
    // Series AST numeric
    abs: Calculator, sign: Calculator, negate: Minus, sqrt: Calculator, exp: Calculator,
    log: Calculator, log1p: Calculator, floor: Calculator, ceil: Calculator, round: Calculator,
    pow: Calculator, clip: Scissors,
    // Series AST null predicates
    is_null: CircleOff, is_not_null: CircleOff, is_nan: CircleOff, is_finite: CircleOff,
    is_infinite: CircleOff, is_unique: CircleOff, is_duplicated: CircleOff,
    // Series AST aggregations
    sum: Sigma, min: Sigma, max: Sigma, mean: Sigma, median: Sigma, count: Sigma,
    n_unique: Sigma, first: Sigma, last: Sigma, mode: Sigma, value_counts: Sigma, null_count: Sigma,
    // Series AST statistics
    std: TrendingUp, var: TrendingUp, quantile: TrendingUp, skew: TrendingUp,
    kurtosis: TrendingUp, entropy: TrendingUp,
    // Series AST null handling (Series-specific)
    drop_nans: XCircle,
    interpolate: TrendingUp,
    // Series AST sorting (Series-specific)
    arg_sort: ArrowUpDown, arg_min: ArrowUpDown, arg_max: ArrowUpDown,
    arg_unique: ArrowUpDown, arg_true: ArrowUpDown, reverse: RefreshCw,
    // Series AST set membership (Series-specific)
    is_in: CheckCircle, is_between: CheckCircle,
    // Series AST window (Series-specific)
    diff: TrendingDown, pct_change: Percent,
    ewm_mean: TrendingUp, ewm_std: TrendingUp, ewm_var: TrendingUp,
    rolling_mean: TrendingUp, rolling_sum: TrendingUp, rolling_min: TrendingUp,
    rolling_max: TrendingUp, rolling_std: TrendingUp, rolling_var: TrendingUp,
    cum_sum: TrendingUp, cum_prod: TrendingUp, cum_min: TrendingUp, cum_max: TrendingUp,
    cum_count: TrendingUp,
    // Series AST sampling (Series-specific)
    shuffle: Shuffle, gather: MousePointer, take: MousePointer,
    gather_every: MousePointer,
    // Series AST encoding
    to_dummies: Grid3x3, cut: Scissors, qcut: Scissors, rle: Repeat, rle_id: Repeat,
    // Series AST misc (Series-specific)
    hash: Hash, append: Plus, lower_bound: ArrowDown, upper_bound: ArrowUp,
    peak_min: TrendingDown, peak_max: TrendingUp, rank: Award,
    // Series AST strings
    str_contains: PenLine, str_starts_with: PenLine, str_ends_with: PenLine,
        str_strip: PenLine, str_lstrip: PenLine, str_rstrip: PenLine, str_strptime: PenLine, contains_any: PenLine,
    str_to_uppercase: PenLine, str_to_lowercase: PenLine,
    str_replace: PenLine, str_replace_all: PenLine, str_slice: PenLine, str_split: PenLine,
    str_zfill: PenLine, str_ljust: PenLine, str_rjust: PenLine,
    str_count_matches: PenLine, str_extract: PenLine, str_extract_all: PenLine,
    str_json_extract: PenLine, str_lengths: PenLine, str_n_chars: PenLine,
    str_len_bytes: PenLine, str_decode: PenLine,
    // Series AST datetime
    dt_year: Calendar, dt_month: Calendar, dt_day: Calendar,
    dt_hour: Clock, dt_minute: Clock, dt_second: Clock,
    dt_millisecond: Clock, dt_microsecond: Clock, dt_nanosecond: Clock,
    dt_weekday: Calendar, dt_week: Calendar, dt_ordinal_day: Calendar,
    dt_total_days: Calendar, dt_total_seconds: Clock, dt_total_minutes: Clock,
    dt_total_hours: Clock, dt_total_milliseconds: Clock, dt_total_microseconds: Clock,
    dt_total_nanoseconds: Clock,
    dt_strftime: Calendar, dt_timestamp: Clock, dt_epoch: Clock,
    dt_truncate: Calendar, dt_round: Calendar, dt_offset_by: Calendar,
    dt_combine: Calendar, dt_is_leap_year: Calendar, dt_days_in_month: Calendar,
    dt_quarter: Calendar,
    // Series AST lists
    arr_sum: List, arr_min: List, arr_max: List, arr_mean: List,
    arr_sort: List, arr_reverse: List, arr_unique: List, arr_get: List,
    arr_first: List, arr_last: List, arr_contains: List, arr_join: List,
    arr_lengths: List, arr_explode: List, arr_flatten: List,
    arr_arg_min: List, arr_arg_max: List, arr_shift: List, arr_slice: List,
    arr_to_struct: List,
    // Series AST structs
    struct_field: Box, struct_rename_fields: Box, struct_unnest: Box,
    struct_json_encode: Box,
    // Series AST bitwise
    bitwise_and: Ampersand, bitwise_or: Ampersand, bitwise_xor: Ampersand,
};
