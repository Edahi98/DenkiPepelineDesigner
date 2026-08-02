/** Types for the AST Visual Editor */

// ─── Node type → color mapping (n8n palette) ────────────────────
export const NODE_TYPE_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    col:          { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Columns3" },
    lit:          { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "Hash" },
    binary:       { bg: "#10b981", border: "#059669", text: "#000000", icon: "GitBranch" },
    unary:        { bg: "#10b981", border: "#059669", text: "#000000", icon: "Minus" },
    call:         { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "FunctionSquare" },
    chain:        { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Link2" },
    alias:        { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Tag" },
    when:         { bg: "#10b981", border: "#059669", text: "#000000", icon: "HelpCircle" },
    cast:         { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "ArrowRightLeft" },
    over:         { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Layers" },
    sort_expr:    { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "ArrowUpDown" },
    scan:         { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Database" },
    file_reader:  { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "FileText" },
    select:       { bg: "#10b981", border: "#059669", text: "#000000", icon: "TableProperties" },
    with_columns: { bg: "#10b981", border: "#059669", text: "#000000", icon: "Columns3" },
    filter:       { bg: "#ec4899", border: "#db2777", text: "#000000", icon: "Filter" },
    group_by:     { bg: "#10b981", border: "#059669", text: "#000000", icon: "Group" },
    sort:         { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "ArrowUpDown" },
    join:         { bg: "#10b981", border: "#059669", text: "#000000", icon: "Merge" },
    join_asof:    { bg: "#10b981", border: "#059669", text: "#000000", icon: "Merge" },
    cross_join:   { bg: "#10b981", border: "#059669", text: "#000000", icon: "Merge" },
    slice:        { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "Scissors" },
    head:         { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "ChevronsUp" },
    tail:         { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "ChevronsDown" },
    rename:       { bg: "#10b981", border: "#059669", text: "#000000", icon: "PenLine" },
    drop:         { bg: "#ec4899", border: "#db2777", text: "#000000", icon: "Trash2" },
    drop_nulls:   { bg: "#ec4899", border: "#db2777", text: "#000000", icon: "XCircle" },
    fill_null:    { bg: "#10b981", border: "#059669", text: "#000000", icon: "PlusCircle" },
    fill_nan:     { bg: "#10b981", border: "#059669", text: "#000000", icon: "PlusCircle" },
    unique:       { bg: "#10b981", border: "#059669", text: "#000000", icon: "Fingerprint" },
    explode:      { bg: "#10b981", border: "#059669", text: "#000000", icon: "Expand" },
    unnest:       { bg: "#10b981", border: "#059669", text: "#000000", icon: "Expand" },
    unpivot:      { bg: "#10b981", border: "#059669", text: "#000000", icon: "RotateCcw" },
    transpose:    { bg: "#10b981", border: "#059669", text: "#000000", icon: "FlipVertical" },
    vstack:       { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Layers" },
    hstack:       { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Layers" },
    sample:       { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "Shuffle" },
    with_row_index:{ bg: "#10b981", border: "#059669", text: "#000000", icon: "Hash" },
    shift:        { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "MoveVertical" },
    top_k:        { bg: "#10b981", border: "#059669", text: "#000000", icon: "ChevronsUp" },
    bottom_k:     { bg: "#10b981", border: "#059669", text: "#000000", icon: "ChevronsDown" },
    collect:      { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Download" },
    describe:     { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Info" },
    branch:       { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "GitBranch" },
    rechunk:      { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "RefreshCw" },
    strict_cast:  { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "ArrowRightLeft" },
    to_physical:  { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "RefreshCw" },
    to_frame:     { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "TableProperties" },
    write_csv:    { bg: "#10b981", border: "#059669", text: "#000000", icon: "Save" },
    write_excel:  { bg: "#10b981", border: "#059669", text: "#000000", icon: "Save" },
    write_html:   { bg: "#10b981", border: "#059669", text: "#000000", icon: "Save" },
    write_json:   { bg: "#10b981", border: "#059669", text: "#000000", icon: "Save" },

    // ─── Bokeh Visualizations ─────────────────────────────────────────
    bokeh_scatter:   { bg: "#9333ea", border: "#7e22ce", text: "#ffffff", icon: "ScatterChart" },
    bokeh_line:      { bg: "#9333ea", border: "#7e22ce", text: "#ffffff", icon: "LineChart" },
    bokeh_pie:       { bg: "#9333ea", border: "#7e22ce", text: "#ffffff", icon: "PieChart" },
    bokeh_histogram: { bg: "#9333ea", border: "#7e22ce", text: "#ffffff", icon: "BarChart" },
    bokeh_confusion_matrix: { bg: "#9333ea", border: "#7e22ce", text: "#ffffff", icon: "Grid3x3" },


    // ─── Machine Learning nodes ──────────────────────────────────────────
    logistic_regression: { bg: "#06b6d4", border: "#0891b2", text: "#000000", icon: "Brain" },
    svc:                 { bg: "#06b6d4", border: "#0891b2", text: "#000000", icon: "Network" },
    multinomial_nb:      { bg: "#06b6d4", border: "#0891b2", text: "#000000", icon: "Brain" },
    sgd_classifier:      { bg: "#06b6d4", border: "#0891b2", text: "#000000", icon: "Brain" },
    kmeans:              { bg: "#06b6d4", border: "#0891b2", text: "#000000", icon: "ScatterChart" },
    dbscan:              { bg: "#06b6d4", border: "#0891b2", text: "#000000", icon: "ScatterChart" },
    agglomerative_clustering: { bg: "#06b6d4", border: "#0891b2", text: "#000000", icon: "Network" },
    truncated_svd:       { bg: "#06b6d4", border: "#0891b2", text: "#000000", icon: "Binary" },
    lda:                 { bg: "#06b6d4", border: "#0891b2", text: "#000000", icon: "Network" },
    nmf:                 { bg: "#06b6d4", border: "#0891b2", text: "#000000", icon: "Binary" },
    tfidf_vectorizer:    { bg: "#06b6d4", border: "#0891b2", text: "#000000", icon: "Type" },
    count_vectorizer:    { bg: "#06b6d4", border: "#0891b2", text: "#000000", icon: "Type" },
    hashing_vectorizer:  { bg: "#06b6d4", border: "#0891b2", text: "#000000", icon: "Hash" },
    fit:                 { bg: "#0d9488", border: "#2dd4bf", text: "#ccfbf1", icon: "Play" },

    // ─── Series AST nodes (174 types) ─────────────────────────────
    // Roots
    get_column:          { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Zap" },
    from_list:           { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "List" },
    from_scalar:         { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Hash" },
    series_filter:       { bg: "#ec4899", border: "#db2777", text: "#000000", icon: "Filter" },
    combine_conditions:  { bg: "#7c3aed", border: "#6d28d9", text: "#ffffff", icon: "Merge" },
    series_arith: { bg: "#7c3aed", border: "#6d28d9", text: "#ffffff", icon: "Calculator" },
    series_compare: { bg: "#7c3aed", border: "#6d28d9", text: "#ffffff", icon: "Ampersand" },
    series_alias: { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Tag" },

    // Numeric operations
    abs:          { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Calculator" },
    sign:         { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Calculator" },
    negate:       { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Minus" },
    sqrt:         { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Calculator" },
    exp:          { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Calculator" },
    log:          { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Calculator" },
    log1p:        { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Calculator" },
    floor:        { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Calculator" },
    ceil:         { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Calculator" },
    round:        { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Calculator" },
    pow:          { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Calculator" },
    clip:         { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Scissors" },

    // Null predicates
    is_null:      { bg: "#ec4899", border: "#db2777", text: "#000000", icon: "CircleOff" },
    is_not_null:  { bg: "#ec4899", border: "#db2777", text: "#000000", icon: "CircleOff" },
    is_nan:       { bg: "#ec4899", border: "#db2777", text: "#000000", icon: "CircleOff" },
    is_finite:    { bg: "#ec4899", border: "#db2777", text: "#000000", icon: "CircleOff" },
    is_infinite:  { bg: "#ec4899", border: "#db2777", text: "#000000", icon: "CircleOff" },
    is_unique:    { bg: "#ec4899", border: "#db2777", text: "#000000", icon: "CircleOff" },
    is_duplicated:{ bg: "#ec4899", border: "#db2777", text: "#000000", icon: "CircleOff" },

    // Aggregations
    sum:          { bg: "#10b981", border: "#059669", text: "#000000", icon: "Sigma" },
    min:          { bg: "#10b981", border: "#059669", text: "#000000", icon: "Sigma" },
    max:          { bg: "#10b981", border: "#059669", text: "#000000", icon: "Sigma" },
    mean:         { bg: "#10b981", border: "#059669", text: "#000000", icon: "Sigma" },
    median:       { bg: "#10b981", border: "#059669", text: "#000000", icon: "Sigma" },
    count:        { bg: "#10b981", border: "#059669", text: "#000000", icon: "Sigma" },
    n_unique:     { bg: "#10b981", border: "#059669", text: "#000000", icon: "Sigma" },
    first:        { bg: "#10b981", border: "#059669", text: "#000000", icon: "Sigma" },
    last:         { bg: "#10b981", border: "#059669", text: "#000000", icon: "Sigma" },
    mode:         { bg: "#10b981", border: "#059669", text: "#000000", icon: "Sigma" },
    value_counts: { bg: "#10b981", border: "#059669", text: "#000000", icon: "Sigma" },
    null_count:   { bg: "#10b981", border: "#059669", text: "#000000", icon: "Sigma" },

    // Statistics
    std:          { bg: "#10b981", border: "#059669", text: "#000000", icon: "TrendingUp" },
    var:          { bg: "#10b981", border: "#059669", text: "#000000", icon: "TrendingUp" },
    quantile:     { bg: "#10b981", border: "#059669", text: "#000000", icon: "TrendingUp" },
    skew:         { bg: "#10b981", border: "#059669", text: "#000000", icon: "TrendingUp" },
    kurtosis:     { bg: "#10b981", border: "#059669", text: "#000000", icon: "TrendingUp" },
    entropy:      { bg: "#10b981", border: "#059669", text: "#000000", icon: "TrendingUp" },

    // Null handling (Series-specific)
    drop_nans:    { bg: "#10b981", border: "#059669", text: "#000000", icon: "XCircle" },
    interpolate:  { bg: "#10b981", border: "#059669", text: "#000000", icon: "TrendingUp" },

    // Sorting (Series-specific)
    arg_sort:     { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "ArrowUpDown" },
    arg_min:      { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "ArrowUpDown" },
    arg_max:      { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "ArrowUpDown" },
    arg_unique:   { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "ArrowUpDown" },
    arg_true:     { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "ArrowUpDown" },
    reverse:      { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "RefreshCw" },

    // Set membership (Series-specific)
    is_in:        { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "CheckCircle" },
    is_between:   { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "CheckCircle" },

    // Window / rolling / ewm / cumulative (Series-specific)
    diff:         { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "TrendingDown" },
    pct_change:   { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Percent" },
    ewm_mean:     { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "TrendingUp" },
    ewm_std:      { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "TrendingUp" },
    ewm_var:      { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "TrendingUp" },
    rolling_mean: { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "TrendingUp" },
    rolling_sum:  { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "TrendingUp" },
    rolling_min:  { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "TrendingUp" },
    rolling_max:  { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "TrendingUp" },
    rolling_std:  { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "TrendingUp" },
    rolling_var:  { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "TrendingUp" },
    cum_sum:      { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "TrendingUp" },
    cum_prod:     { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "TrendingUp" },
    cum_min:      { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "TrendingUp" },
    cum_max:      { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "TrendingUp" },
    cum_count:    { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "TrendingUp" },

    // Sampling (Series-specific)
    shuffle:      { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "Shuffle" },
    gather:       { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "MousePointer" },
    take:         { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "MousePointer" },
    gather_every: { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "MousePointer" },

    // Encoding
    to_dummies:   { bg: "#10b981", border: "#059669", text: "#000000", icon: "Grid3x3" },
    cut:          { bg: "#10b981", border: "#059669", text: "#000000", icon: "Scissors" },
    qcut:         { bg: "#10b981", border: "#059669", text: "#000000", icon: "Scissors" },
    rle:          { bg: "#10b981", border: "#059669", text: "#000000", icon: "Repeat" },
    rle_id:       { bg: "#10b981", border: "#059669", text: "#000000", icon: "Repeat" },

    // Misc (Series-specific)
    hash:         { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "Hash" },
    append:       { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "Plus" },
    lower_bound:  { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "ArrowDown" },
    upper_bound:  { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "ArrowUp" },
    peak_min:     { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "TrendingDown" },
    peak_max:     { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "TrendingUp" },
    rank:         { bg: "#f59e0b", border: "#d97706", text: "#000000", icon: "Award" },

    // String operations
    str_contains:     { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    contains_any:     { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_starts_with:  { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_ends_with:    { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_strip:        { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_lstrip:       { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_rstrip:       { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_to_uppercase: { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_to_lowercase: { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_replace:      { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_replace_all:  { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_slice:        { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_split:        { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_zfill:        { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_ljust:        { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_rjust:        { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_count_matches:{ bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_extract:      { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_extract_all:  { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_json_extract: { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_lengths:      { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_n_chars:      { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_len_bytes:    { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_strptime:     { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },
    str_decode:       { bg: "#ff5e00", border: "#cc4b00", text: "#f59e0b", icon: "PenLine" },

    // Datetime operations
    dt_year:              { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Calendar" },
    dt_month:             { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Calendar" },
    dt_day:               { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Calendar" },
    dt_hour:              { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Clock" },
    dt_minute:            { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Clock" },
    dt_second:            { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Clock" },
    dt_millisecond:       { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Clock" },
    dt_microsecond:       { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Clock" },
    dt_nanosecond:        { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Clock" },
    dt_weekday:           { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Calendar" },
    dt_week:              { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Calendar" },
    dt_ordinal_day:       { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Calendar" },
    dt_total_days:        { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Calendar" },
    dt_total_seconds:     { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Clock" },
    dt_total_minutes:     { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Clock" },
    dt_total_hours:       { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Clock" },
    dt_total_milliseconds:{ bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Clock" },
    dt_total_microseconds:{ bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Clock" },
    dt_total_nanoseconds: { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Clock" },
    dt_strftime:          { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Calendar" },
    dt_timestamp:         { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Clock" },
    dt_epoch:             { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Clock" },
    dt_truncate:          { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Calendar" },
    dt_round:             { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Calendar" },
    dt_offset_by:         { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Calendar" },
    dt_combine:           { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Calendar" },
    dt_is_leap_year:      { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Calendar" },
    dt_days_in_month:     { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Calendar" },
    dt_quarter:           { bg: "#3b82f6", border: "#2563eb", text: "#000000", icon: "Calendar" },

    // List operations
    arr_sum:          { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_min:          { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_max:          { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_mean:         { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_sort:         { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_reverse:      { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_unique:       { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_get:          { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_first:        { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_last:         { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_contains:     { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_join:         { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_lengths:      { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_explode:      { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_flatten:      { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_arg_min:      { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_arg_max:      { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_shift:        { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_slice:        { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },
    arr_to_struct:    { bg: "#ff5e00", border: "#cc4b00", text: "#000000", icon: "List" },

    // Struct operations
    struct_field:           { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Box" },
    struct_rename_fields:   { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Box" },
    struct_unnest:          { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Box" },
    struct_json_encode:     { bg: "#8b5cf6", border: "#7c3aed", text: "#000000", icon: "Box" },

    // Bitwise operations
    bitwise_and:    { bg: "#10b981", border: "#059669", text: "#000000", icon: "Ampersand" },
    bitwise_or:     { bg: "#10b981", border: "#059669", text: "#000000", icon: "Ampersand" },
    bitwise_xor:    { bg: "#10b981", border: "#059669", text: "#000000", icon: "Ampersand" },
};

// ─── Pipeline JSON shape ────────────────────────────────────────
export interface PipelineStep {
    type: string;
    [key: string]: any;
}

export interface PipelineJson {
    pipeline: PipelineStep[];
}

// ─── Execution response ─────────────────────────────────────────
export interface DataframeResult {
    columns: string[];
    data: Record<string, any>[];
    shape: [number, number];
    /** Present when the node that produced this table is a Bokeh node. */
    plot?: string;
}

export interface SeriesResult {
    name: string;
    values: any[];
    dtype: string;
    length: number;
}

export interface ExecutionResult {
    ast_tree: string;
    sql: string | null;
    sql_error?: string | null;
    /** Single-output legacy pipeline result (`{"dataframe": ...}`). */
    dataframe?: DataframeResult;
    /** Single-output Series-chain result, or standalone `{"series": [...]}` runs. */
    series?: SeriesResult;
    /**
     * Multi-output (or single-output) graph result — `Tsubasa`'s `/execute`
     * returns `{"outputs": {name: {...}}}` for any `{"graph": ...}`
     * document, one entry per named sink, sharing sub-plans exactly as
     * `Graph.collect()` computed them server-side. Most sinks are a
     * `DataframeResult`, but a Series-typed graph output (a `get_column`
     * chain bridged to a real DataFrame, or a self-contained chain) comes
     * back as a `SeriesResult` in the same map — discriminate per-entry
     * by shape (`isSeriesResult` in ResultTable.tsx), not by position.
     */
    outputs?: Record<string, DataframeResult | SeriesResult>;
    /** @deprecated kept only as a fallback for older cached responses — the
     * backend now nests a node's plot under its own `dataframe`/`outputs[name]`
     * entry so multi-output results don't need a single ambiguous top-level plot. */
    plot?: string;
    prunedXmlPath?: string;
    pruningError?: string;
}


export interface ExecutionError {
    error: string;
    traceback?: string;
}

// ─── ReactFlow custom node data ─────────────────────────────────
export interface AstNodeData extends Record<string, unknown> {
    nodeType: string;
    label: string;
    properties: Record<string, any>;
    stepIndex: number;
    isExpression: boolean;
}
