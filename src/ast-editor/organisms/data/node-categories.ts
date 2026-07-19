import type { ElementType } from "react";
import {
    Download, Columns3, GitBranch, Group, PenLine, ChevronRight, Layers,
    TableProperties, ScatterChart, Brain, Zap, Calculator, Sigma, TrendingUp,
    CircleOff, ArrowUpDown, Shuffle, Grid3x3, Hash, List, Calendar, Box, Ampersand,
} from "lucide-react";

export interface NodeItem {
    type: string;
    label: string;
    description: string;
    isExpression: boolean;
    method?: string;
    presetProperties?: Record<string, any>;
}

export interface Category {
    id: string;
    name: string;
    icon: ElementType;
    items: NodeItem[];
}

export const CATEGORIES: Category[] = [
    {
        id: "export",
        name: "Exportadores",
        icon: Download,
        items: [
            { type: "write_csv", label: "Write CSV", description: "Export as CSV file", isExpression: false, presetProperties: { path: "" } },
            { type: "write_excel", label: "Write Excel", description: "Export as Excel file", isExpression: false, presetProperties: { path: "" } },
            { type: "write_html", label: "Write HTML", description: "Export as HTML file", isExpression: false, presetProperties: { path: "" } },
            { type: "write_json", label: "Write JSON", description: "Export as JSON file", isExpression: false, presetProperties: { path: "" } }
        ]
    },
    {
        id: "columns",
        name: "Columnas",
        icon: Columns3,
        items: [
            { type: "col", label: "Column Reference", description: "Reference a column by name", isExpression: true, presetProperties: { name: "" } },
            { type: "lit", label: "Literal Value", description: "Constant value (number, string, bool)", isExpression: true, presetProperties: { value: "", dtype: "" } }
        ]
    },
    {
        id: "operations",
        name: "Operaciones",
        icon: GitBranch,
        items: [
            { type: "binary", label: "Binary Op", description: "Arithmetic or comparison (+, -, ==, etc.)", isExpression: true, presetProperties: { op: "+" } },
            { type: "unary", label: "Unary Op", description: "Negate or logical not", isExpression: true, presetProperties: { op: "negate" } },
            { type: "alias", label: "Alias", description: "Rename expression output", isExpression: true, presetProperties: { name: "" } },
            { type: "cast", label: "Cast", description: "Change data type", isExpression: true, presetProperties: { dtype: "Int32", strict: true } },
            { type: "call", label: "Generic Call", description: "Call any custom Polars method", isExpression: true, presetProperties: { method: "", args: {} } },
            { type: "chain", label: "Chain", description: "Binary chain with N operands (OR/AND). Wraps nested BinaryOps.", isExpression: true, presetProperties: { op: "|" } },
            { type: "when", label: "When / Then", description: "Conditional expression (CASE WHEN)", isExpression: true },
            { type: "sort_expr", label: "Sort Expr", description: "Sort within an expression", isExpression: true, presetProperties: { descending: false, nulls_last: false } }
        ]
    },
    {
        id: "aggregations",
        name: "Agregaciones",
        icon: Group,
        items: [
            { type: "group_by", label: "Group By", description: "Group DataFrame rows", isExpression: false, presetProperties: { by: [] } },
            { type: "call", label: "Sum", description: "Sum values", isExpression: true, method: "sum" },
            { type: "call", label: "Mean", description: "Average value", isExpression: true, method: "mean" },
            { type: "call", label: "Min", description: "Minimum value", isExpression: true, method: "min" },
            { type: "call", label: "Max", description: "Maximum value", isExpression: true, method: "max" },
            { type: "call", label: "Count", description: "Count non-null values", isExpression: true, method: "count" },
            { type: "call", label: "N Unique", description: "Count unique values", isExpression: true, method: "n_unique" },
            { type: "call", label: "Std Dev", description: "Standard deviation", isExpression: true, method: "std", presetProperties: { args: { ddof: 1 } } },
            { type: "call", label: "Variance", description: "Variance", isExpression: true, method: "var", presetProperties: { args: { ddof: 1 } } }
        ]
    },
    {
        id: "strings",
        name: "Strings",
        icon: PenLine,
        items: [
            { type: "call", label: "Contains", description: "Check if string contains pattern", isExpression: true, method: "str.contains", presetProperties: { args: { pattern: "" } } },
            { type: "call", label: "Replace", description: "Replace substring", isExpression: true, method: "str.replace", presetProperties: { args: { pattern: "", value: "" } } },
            { type: "call", label: "Replace All", description: "Replace all occurrences", isExpression: true, method: "str.replace_all", presetProperties: { args: { pattern: "", value: "" } } },
            { type: "call", label: "Uppercase", description: "Convert to uppercase", isExpression: true, method: "str.to_uppercase" },
            { type: "call", label: "Lowercase", description: "Convert to lowercase", isExpression: true, method: "str.to_lowercase" },
            { type: "call", label: "Starts With", description: "Check prefix", isExpression: true, method: "str.starts_with", presetProperties: { args: { prefix: "" } } },
            { type: "call", label: "Ends With", description: "Check suffix", isExpression: true, method: "str.ends_with", presetProperties: { args: { suffix: "" } } },
            { type: "call", label: "Split", description: "Split by separator", isExpression: true, method: "str.split", presetProperties: { args: { by: "," } } },
            { type: "call", label: "Strptime", description: "Parse string to Date/Datetime", isExpression: true, method: "str.strptime", presetProperties: { args: { dtype: "Date", format: "%Y-%m-%d" } } },
        ]
    },
    {
        id: "dates",
        name: "Fechas",
        icon: ChevronRight,
        items: [
            { type: "call", label: "Year", description: "Extract year", isExpression: true, method: "dt.year" },
            { type: "call", label: "Month", description: "Extract month (1-12)", isExpression: true, method: "dt.month" },
            { type: "call", label: "Day", description: "Extract day of month", isExpression: true, method: "dt.day" },
            { type: "call", label: "Hour", description: "Extract hour (0-23)", isExpression: true, method: "dt.hour" },
            { type: "call", label: "Strftime", description: "Format date to string", isExpression: true, method: "dt.strftime", presetProperties: { args: { format: "%Y-%m-%d" } } },
        ]
    },
    {
        id: "window",
        name: "Ventana",
        icon: Layers,
        items: [
            { type: "over", label: "Over (Window)", description: "Evaluate over group partition", isExpression: true, presetProperties: { partition_by: [] } },
            { type: "call", label: "Rolling Mean", description: "Rolling mean over window", isExpression: true, method: "rolling_mean", presetProperties: { args: { window_size: 3 } } },
            { type: "call", label: "Rolling Sum", description: "Rolling sum over window", isExpression: true, method: "rolling_sum", presetProperties: { args: { window_size: 3 } } },
            { type: "call", label: "Shift", description: "Shift values by offset", isExpression: true, method: "shift", presetProperties: { args: { n: 1 } } }
        ]
    },
    {
        id: "dataframe",
        name: "DataFrame",
        icon: TableProperties,
        items: [
            { type: "scan", label: "Scan Data", description: "Read dataset or raw data", isExpression: false, presetProperties: { data: {} } },
            { type: "file_reader", label: "File Reader", description: "Read docx, doc, xls, xlsx, pdf files via libllm", isExpression: false, presetProperties: { path: "", data: {} } },
            { type: "select", label: "Select", description: "Select or project columns", isExpression: false },
            { type: "with_columns", label: "With Columns", description: "Add or evaluate columns", isExpression: false },
            { type: "filter", label: "Filter", description: "Filter rows by predicate", isExpression: false },
            { type: "sort", label: "Sort", description: "Sort DataFrame rows", isExpression: false, presetProperties: { by: [], descending: false } },
            { type: "join", label: "Join", description: "Join with another DataFrame", isExpression: false, presetProperties: { how: "inner", suffix: "_right" } },
            { type: "join_asof", label: "Join Asof", description: "Asof join (nearest match)", isExpression: false, presetProperties: { strategy: "backward" } },
            { type: "cross_join", label: "Cross Join", description: "Cartesian product join", isExpression: false },
            { type: "slice", label: "Slice", description: "Get a slice of rows", isExpression: false, presetProperties: { offset: 0, length: 10 } },
            { type: "head", label: "Head", description: "Get first N rows", isExpression: false, presetProperties: { n: 5 } },
            { type: "tail", label: "Tail", description: "Get last N rows", isExpression: false, presetProperties: { n: 5 } },
            { type: "rename", label: "Rename", description: "Rename columns mapping", isExpression: false, presetProperties: { mapping: {} } },
            { type: "drop", label: "Drop Columns", description: "Drop specified columns", isExpression: false, presetProperties: { columns: [] } },
            { type: "drop_nulls", label: "Drop Nulls", description: "Remove rows with nulls", isExpression: false, presetProperties: { subset: null } },
            { type: "fill_null", label: "Fill Null", description: "Fill null values", isExpression: false, presetProperties: { strategy: "zero" } },
            { type: "fill_nan", label: "Fill NaN", description: "Fill NaN values", isExpression: false, presetProperties: { strategy: "zero" } },
            { type: "to_frame", label: "To Frame", description: "Convierte una Serie en un DataFrame", isExpression: false, presetProperties: { name: "" } },
            { type: "unique", label: "Unique", description: "Keep unique rows", isExpression: false, presetProperties: { keep: "first" } },
            // ─── DFNode types registered in Tsubasa but previously
            // missing from this palette (see AUDITORIA_AST_BULMA_TSUBASA.md
            // F7) — no draggable representative meant the user had no way
            // to create them at all. Excludes "sample"/"shift"/"rechunk":
            // those three strings are already registered as Series node
            // types in EXPR_TYPES (ast_to_flow.ts) and seriesNodeTypes
            // (flow_to_ast.ts); adding a DFNode item under the same bare
            // type string would make a DF-typed node reload as
            // isExpression:true on the next export/reload round trip
            // (both sides key isExpression purely off the type string,
            // with no DF/Series disambiguation for a name shared by both
            // registries) — a real data-corruption risk, not just a
            // labeling nicety. Needs either a distinct backend alias or a
            // frontend-side disambiguation before those three can be
            // added safely (see F8).
            { type: "vstack", label: "VStack", description: "Stack rows from another DataFrame (union)", isExpression: false },
            { type: "hstack", label: "HStack", description: "Stack columns from another DataFrame side-by-side", isExpression: false },
            { type: "explode", label: "Explode", description: "Explode a list column into multiple rows", isExpression: false, presetProperties: { columns: [] } },
            { type: "unnest", label: "Unnest", description: "Unnest struct columns into separate columns", isExpression: false, presetProperties: { columns: [] } },
            { type: "unpivot", label: "Unpivot", description: "Melt wide columns into long format", isExpression: false, presetProperties: { on: [], index: [], variable_name: "variable", value_name: "value" } },
            { type: "transpose", label: "Transpose", description: "Transpose rows and columns", isExpression: false, presetProperties: { include_header: false, header_name: "column" } },
            { type: "with_row_index", label: "Row Index", description: "Add a row index column", isExpression: false, presetProperties: { name: "index", offset: 0 } },
            { type: "top_k", label: "Top K", description: "Keep the K largest rows by column(s)", isExpression: false, presetProperties: { k: 5, by: "" } },
            { type: "bottom_k", label: "Bottom K", description: "Keep the K smallest rows by column(s)", isExpression: false, presetProperties: { k: 5, by: "" } },
            { type: "collect", label: "Collect", description: "Materialize the LazyFrame (checkpoint)", isExpression: false },
            { type: "describe", label: "Describe", description: "Statistical summary of the DataFrame", isExpression: false }
        ]
    },
    // ─── Visualizations Category ─────────────────────────────────────────
    {
        id: "visualizations",
        name: "Visualizaciones",
        icon: ScatterChart,
        items: [
            { type: "bokeh_scatter", label: "Scatter Plot", description: "Gráfico de dispersión", isExpression: false, presetProperties: { x: "", y: "", title: "" } },
            { type: "bokeh_line", label: "Line Chart", description: "Gráfico de líneas", isExpression: false, presetProperties: { x: "", y: "", title: "" } },
            { type: "bokeh_pie", label: "Pie Chart", description: "Gráfico de pastel", isExpression: false, presetProperties: { labels: "", values: "", title: "" } },
            { type: "bokeh_histogram", label: "Histogram", description: "Histograma interactivo", isExpression: false, presetProperties: { column: "", bins: 10, title: "" } },
            { type: "bokeh_confusion_matrix", label: "Confusion Matrix", description: "Matriz de confusión", isExpression: false, presetProperties: { y_true: "", y_pred: "", title: "" } }
        ]
    },
    // ─── Machine Learning Category ───────────────────────────────────────
    {
        id: "machine_learning",
        name: "Machine Learning",
        icon: Brain,
        items: [
            { type: "logistic_regression", label: "Logistic Regression", description: "Clasificación lineal", isExpression: false, presetProperties: { feature_columns: [], target_column: "", output_column: "prediction", params: { max_iter: 100, C: 1.0 } } },
            { type: "svc", label: "SVC", description: "Clasificación (Support Vector)", isExpression: false, presetProperties: { feature_columns: [], target_column: "", output_column: "prediction", params: { kernel: "rbf" } } },
            { type: "multinomial_nb", label: "Multinomial NB", description: "Clasificación Naive Bayes", isExpression: false, presetProperties: { feature_columns: [], target_column: "", output_column: "prediction", params: { alpha: 1.0 } } },
            { type: "sgd_classifier", label: "SGD Classifier", description: "Clasificación SGD", isExpression: false, presetProperties: { feature_columns: [], target_column: "", output_column: "prediction", params: { loss: "hinge" } } },

            { type: "kmeans", label: "KMeans", description: "Clustering particional", isExpression: false, presetProperties: { feature_columns: [], output_column: "cluster", params: { n_clusters: 8 } } },
            { type: "dbscan", label: "DBSCAN", description: "Clustering por densidad", isExpression: false, presetProperties: { feature_columns: [], output_column: "cluster", params: { eps: 0.5, min_samples: 5 } } },
            { type: "agglomerative_clustering", label: "Agglomerative", description: "Clustering jerárquico", isExpression: false, presetProperties: { feature_columns: [], output_column: "cluster", params: { n_clusters: 2 } } },

            { type: "truncated_svd", label: "Truncated SVD", description: "Reducción de dimensiones", isExpression: false, presetProperties: { feature_columns: [], output_prefix: "pca_", params: { n_components: 2 } } },
            { type: "lda", label: "LDA", description: "Modelado de temas (LDA)", isExpression: false, presetProperties: { feature_columns: [], output_prefix: "lda_", params: { n_components: 10 } } },
            { type: "nmf", label: "NMF", description: "Factorización de matrices (NMF)", isExpression: false, presetProperties: { feature_columns: [], output_prefix: "nmf_", params: { n_components: 10 } } },

            { type: "tfidf_vectorizer", label: "TF-IDF Vectorizer", description: "Vectorización de texto (TF-IDF)", isExpression: false, presetProperties: { input_column: "", output_prefix: "tfidf_", params: { max_features: 100 } } },
            { type: "count_vectorizer", label: "Count Vectorizer", description: "Vectorización por frecuencia", isExpression: false, presetProperties: { input_column: "", output_prefix: "count_", params: { max_features: 100 } } },
            { type: "hashing_vectorizer", label: "Hashing Vectorizer", description: "Vectorización por hashing", isExpression: false, presetProperties: { input_column: "", output_prefix: "hash_", params: { n_features: 100 } } },
            { type: "fit", label: "Fit Model", description: "Persiste y entrena el modelo", isExpression: false, presetProperties: { force_fit: false } }
        ]
    },
    // ─── Series AST Categories ───────────────────────────────────────
    {
        id: "series_roots",
        name: "Series Roots",
        icon: Zap,
        items: [
            { type: "get_column", label: "Get Column", description: "Extract a column from DataFrame", isExpression: true, presetProperties: { name: "" } },
            { type: "from_list", label: "From List", description: "Create Series from list", isExpression: true, presetProperties: { values: "[]", dtype: "String" } },
            { type: "from_scalar", label: "From Scalar", description: "Create Series from scalar", isExpression: true, presetProperties: { value: "", dtype: "String" } },
            { type: "load_dataset_column", label: "Load Dataset Column", description: "Load file directly to Series", isExpression: true, presetProperties: { path: "", column: "" } }
        ]
    },
    {
        id: "series_numeric",
        name: "Series Numeric",
        icon: Calculator,
        items: [
            { type: "abs", label: "Absolute Value", description: "Element-wise absolute value", isExpression: true },
            { type: "sign", label: "Sign", description: "Element-wise sign (-1, 0, 1)", isExpression: true },
            { type: "negate", label: "Negate", description: "Element-wise negation", isExpression: true },
            { type: "sqrt", label: "Square Root", description: "Element-wise square root", isExpression: true },
            { type: "exp", label: "Exponential", description: "Element-wise e^x", isExpression: true },
            { type: "log", label: "Logarithm", description: "Element-wise natural log", isExpression: true, presetProperties: { base: null } },
            { type: "log1p", label: "Log1p", description: "Element-wise log(1+x)", isExpression: true },
            { type: "floor", label: "Floor", description: "Round down to integer", isExpression: true },
            { type: "ceil", label: "Ceil", description: "Round up to integer", isExpression: true },
            { type: "round", label: "Round", description: "Round to decimals", isExpression: true, presetProperties: { decimals: 0, mode: null } },
            { type: "pow", label: "Power", description: "Element-wise power", isExpression: true, presetProperties: { exponent: 2 } },
            { type: "clip", label: "Clip", description: "Clip to min/max bounds", isExpression: true, presetProperties: { min_bound: null, max_bound: null } }
        ]
    },
    {
        id: "series_aggregations",
        name: "Series Aggregations",
        icon: Sigma,
        items: [
            { type: "sum", label: "Sum", description: "Sum all elements", isExpression: true },
            { type: "min", label: "Min", description: "Minimum value", isExpression: true },
            { type: "max", label: "Max", description: "Maximum value", isExpression: true },
            { type: "mean", label: "Mean", description: "Arithmetic mean", isExpression: true },
            { type: "median", label: "Median", description: "Median value", isExpression: true },
            { type: "count", label: "Count", description: "Count non-null elements", isExpression: true },
            { type: "n_unique", label: "N Unique", description: "Count unique values", isExpression: true },
            { type: "first", label: "First", description: "First element", isExpression: true },
            { type: "last", label: "Last", description: "Last element", isExpression: true },
            { type: "mode", label: "Mode", description: "Most frequent value", isExpression: true },
            { type: "value_counts", label: "Value Counts", description: "Count occurrences", isExpression: true, presetProperties: { sort: true, parallel: false } },
            { type: "null_count", label: "Null Count", description: "Count null values", isExpression: true }
        ]
    },
    {
        id: "series_statistics",
        name: "Series Statistics",
        icon: TrendingUp,
        items: [
            { type: "std", label: "Std Dev", description: "Standard deviation", isExpression: true, presetProperties: { ddof: 1 } },
            { type: "var", label: "Variance", description: "Variance", isExpression: true, presetProperties: { ddof: 1 } },
            { type: "quantile", label: "Quantile", description: "Quantile at probability", isExpression: true, presetProperties: { quantile: 0.5, interpolation: "nearest" } },
            { type: "skew", label: "Skewness", description: "Sample skewness", isExpression: true, presetProperties: { bias: true } },
            { type: "kurtosis", label: "Kurtosis", description: "Sample kurtosis", isExpression: true, presetProperties: { fisher: true, bias: true } },
            { type: "entropy", label: "Entropy", description: "Shannon entropy", isExpression: true, presetProperties: { base: 2 } }
        ]
    },
    {
        id: "series_null",
        name: "Series Null Handling",
        icon: CircleOff,
        items: [
            { type: "is_null", label: "Is Null", description: "Boolean mask for nulls", isExpression: true },
            { type: "is_not_null", label: "Is Not Null", description: "Boolean mask for non-nulls", isExpression: true },
            { type: "fill_null", label: "Fill Null", description: "Replace null values", isExpression: true, presetProperties: { value: null, strategy: null, limit: null } },
            { type: "fill_nan", label: "Fill NaN", description: "Replace NaN values", isExpression: true, presetProperties: { value: 0 } },
            { type: "drop_nulls", label: "Drop Nulls", description: "Remove null values", isExpression: true },
            { type: "drop_nans", label: "Drop NaNs", description: "Remove NaN values", isExpression: true },
            { type: "interpolate", label: "Interpolate", description: "Linear interpolation", isExpression: true, presetProperties: { method: "linear" } }
        ]
    },
    {
        id: "series_sorting",
        name: "Series Sorting",
        icon: ArrowUpDown,
        items: [
            { type: "sort", label: "Sort", description: "Sort Series", isExpression: true, presetProperties: { descending: false, nulls_last: false, maintain_order: false } },
            { type: "arg_sort", label: "Arg Sort", description: "Indices that would sort", isExpression: true, presetProperties: { descending: false, nulls_last: false } },
            { type: "arg_min", label: "Arg Min", description: "Index of minimum", isExpression: true },
            { type: "arg_max", label: "Arg Max", description: "Index of maximum", isExpression: true },
            { type: "arg_unique", label: "Arg Unique", description: "Indices of unique values", isExpression: true },
            { type: "arg_true", label: "Arg True", description: "Indices where True", isExpression: true },
            { type: "reverse", label: "Reverse", description: "Reverse order", isExpression: true }
        ]
    },
    {
        id: "series_window",
        name: "Series Window",
        icon: Layers,
        items: [
            { type: "shift", label: "Shift", description: "Shift by n positions", isExpression: true, presetProperties: { n: 1, fill_value: null } },
            { type: "diff", label: "Diff", description: "Element-wise difference", isExpression: true, presetProperties: { n: 1, null_behavior: "ignore" } },
            { type: "pct_change", label: "Pct Change", description: "Percent change", isExpression: true, presetProperties: { n: 1 } },
            { type: "ewm_mean", label: "EWM Mean", description: "Exponentially weighted mean", isExpression: true, presetProperties: { alpha: 0.5, adjust: true, min_periods: 1, ignore_nulls: true } },
            { type: "ewm_std", label: "EWM Std", description: "Exponentially weighted std", isExpression: true, presetProperties: { alpha: 0.5, adjust: true, min_periods: 1, ignore_nulls: true, bias: false } },
            { type: "ewm_var", label: "EWM Var", description: "Exponentially weighted var", isExpression: true, presetProperties: { alpha: 0.5, adjust: true, min_periods: 1, ignore_nulls: true, bias: false } },
            { type: "rolling_mean", label: "Rolling Mean", description: "Rolling mean", isExpression: true, presetProperties: { window_size: 3, weights: null, min_periods: 1, center: false, closed: "right" } },
            { type: "rolling_sum", label: "Rolling Sum", description: "Rolling sum", isExpression: true, presetProperties: { window_size: 3, weights: null, min_periods: 1, center: false, closed: "right" } },
            { type: "rolling_min", label: "Rolling Min", description: "Rolling minimum", isExpression: true, presetProperties: { window_size: 3, weights: null, min_periods: 1, center: false, closed: "right" } },
            { type: "rolling_max", label: "Rolling Max", description: "Rolling maximum", isExpression: true, presetProperties: { window_size: 3, weights: null, min_periods: 1, center: false, closed: "right" } },
            { type: "rolling_std", label: "Rolling Std", description: "Rolling std", isExpression: true, presetProperties: { window_size: 3, weights: null, min_periods: 1, center: false, closed: "right", ddof: 1 } },
            { type: "rolling_var", label: "Rolling Var", description: "Rolling variance", isExpression: true, presetProperties: { window_size: 3, weights: null, min_periods: 1, center: false, closed: "right", ddof: 1 } },
            { type: "cum_sum", label: "Cum Sum", description: "Cumulative sum", isExpression: true, presetProperties: { reverse: false } },
            { type: "cum_prod", label: "Cum Prod", description: "Cumulative product", isExpression: true, presetProperties: { reverse: false } },
            { type: "cum_min", label: "Cum Min", description: "Cumulative minimum", isExpression: true, presetProperties: { reverse: false } },
            { type: "cum_max", label: "Cum Max", description: "Cumulative maximum", isExpression: true, presetProperties: { reverse: false } },
            { type: "cum_count", label: "Cum Count", description: "Cumulative count", isExpression: true, presetProperties: { reverse: false } }
        ]
    },
    {
        id: "series_sampling",
        name: "Series Sampling",
        icon: Shuffle,
        items: [
            { type: "sample", label: "Sample", description: "Random sample", isExpression: true, presetProperties: { n: null, fraction: null, with_replacement: false, seed: null } },
            { type: "shuffle", label: "Shuffle", description: "Random shuffle", isExpression: true, presetProperties: { seed: null } },
            { type: "gather", label: "Gather", description: "Take by indices", isExpression: true, presetProperties: { indices: "[]" } },
            { type: "take", label: "Take", description: "Alias of gather", isExpression: true, presetProperties: { indices: "[]" } },
            { type: "gather_every", label: "Gather Every", description: "Take every n-th value", isExpression: true, presetProperties: { n: 2, offset: 0 } }
        ]
    },
    {
        id: "series_encoding",
        name: "Series Encoding",
        icon: Grid3x3,
        items: [
            { type: "to_dummies", label: "To Dummies", description: "One-hot encode", isExpression: true, presetProperties: { separator: "_", drop_first: false } },
            { type: "cut", label: "Cut", description: "Bin into intervals", isExpression: true, presetProperties: { breaks: "[]", labels: null, left_closed: false, include_breaks: false } },
            { type: "qcut", label: "QCut", description: "Bin by quantiles", isExpression: true, presetProperties: { quantiles: "[]", labels: null, left_closed: false, allow_duplicates: false } },
            { type: "rle", label: "RLE", description: "Run-length encoding", isExpression: true },
            { type: "rle_id", label: "RLE ID", description: "Run-length ID", isExpression: true }
        ]
    },
    {
        id: "series_misc",
        name: "Series Misc",
        icon: Hash,
        items: [
            { type: "hash", label: "Hash", description: "Hash each element", isExpression: true, presetProperties: { seed: 0, seed_1: null, seed_2: null, seed_3: null } },
            { type: "rechunk", label: "Rechunk", description: "Rechunk memory", isExpression: true },
            { type: "append", label: "Append", description: "Append another Series", isExpression: true, presetProperties: { other: null, upcast: true } },
            { type: "lower_bound", label: "Lower Bound", description: "Dtype lower bound", isExpression: true },
            { type: "upper_bound", label: "Upper Bound", description: "Dtype upper bound", isExpression: true },
            { type: "peak_min", label: "Peak Min", description: "Local minima mask", isExpression: true },
            { type: "peak_max", label: "Peak Max", description: "Local maxima mask", isExpression: true },
            { type: "rank", label: "Rank", description: "Rank values", isExpression: true, presetProperties: { method: "average", descending: false, seed: null } },
            { type: "is_in", label: "Is In", description: "Check membership", isExpression: true, presetProperties: { values: "[]", nulls_equal: false } },
            { type: "is_between", label: "Is Between", description: "Check range", isExpression: true, presetProperties: { lower: null, upper: null, closed: "both" } },
            { type: "is_finite", label: "Is Finite", description: "Check finite", isExpression: true },
            { type: "is_infinite", label: "Is Infinite", description: "Check infinite", isExpression: true },
            { type: "is_unique", label: "Is Unique", description: "Check uniqueness", isExpression: true },
            { type: "is_duplicated", label: "Is Duplicated", description: "Check duplicates", isExpression: true },
            { type: "unique", label: "Unique", description: "Drop duplicates", isExpression: true, presetProperties: { maintain_order: false } },
            { type: "series_filter", label: "Filter (Series)", description: "Filter Series by predicate", isExpression: true }
        ]
    },
    {
        id: "series_strings",
        name: "Series Strings",
        icon: PenLine,
        items: [
            { type: "str_contains", label: "Contains", description: "Check if contains pattern", isExpression: true, presetProperties: { pattern: "", literal: false, strict: true } },
            { type: "contains_any", label: "Contains Any", description: "Check if contains any pattern", isExpression: true, presetProperties: { patterns: "[]" } },
            { type: "str_starts_with", label: "Starts With", description: "Check prefix", isExpression: true, presetProperties: { prefix: "" } },
            { type: "str_ends_with", label: "Ends With", description: "Check suffix", isExpression: true, presetProperties: { suffix: "" } },
            { type: "str_strip", label: "Strip", description: "Strip both ends", isExpression: true, presetProperties: { characters: null } },
            { type: "str_lstrip", label: "LStrip", description: "Strip start", isExpression: true, presetProperties: { characters: null } },
            { type: "str_rstrip", label: "RStrip", description: "Strip end", isExpression: true, presetProperties: { characters: null } },
            { type: "str_to_uppercase", label: "Uppercase", description: "Convert to uppercase", isExpression: true },
            { type: "str_to_lowercase", label: "Lowercase", description: "Convert to lowercase", isExpression: true },
            { type: "str_replace", label: "Replace", description: "Replace first match", isExpression: true, presetProperties: { pattern: "", value: "", literal: false } },
            { type: "str_replace_all", label: "Replace All", description: "Replace all matches", isExpression: true, presetProperties: { pattern: "", value: "", literal: false } },
            { type: "str_slice", label: "Slice", description: "Substring by offset/length", isExpression: true, presetProperties: { offset: 0, length: null } },
            { type: "str_split", label: "Split", description: "Split by separator", isExpression: true, presetProperties: { by: ",", inclusive: false } },
            { type: "str_zfill", label: "ZFill", description: "Left-pad with zeros", isExpression: true, presetProperties: { length: 1 } },
            { type: "str_ljust", label: "LJust", description: "Left-justify", isExpression: true, presetProperties: { length: 1, fill_char: " " } },
            { type: "str_rjust", label: "RJust", description: "Right-justify", isExpression: true, presetProperties: { length: 1, fill_char: " " } },
            { type: "str_count_matches", label: "Count Matches", description: "Count pattern occurrences", isExpression: true, presetProperties: { pattern: "", literal: false } },
            { type: "str_extract", label: "Extract", description: "Extract regex group", isExpression: true, presetProperties: { pattern: "", group_index: 1 } },
            { type: "str_extract_all", label: "Extract All", description: "Extract all matches", isExpression: true, presetProperties: { pattern: "" } },
            { type: "str_json_extract", label: "JSON Extract", description: "Parse JSON string", isExpression: true, presetProperties: { dtype: "String", infer_schema_length: null } },
            { type: "str_lengths", label: "Lengths", description: "Length in bytes", isExpression: true },
            { type: "str_n_chars", label: "N Chars", description: "Length in characters", isExpression: true },
            { type: "str_len_bytes", label: "Len Bytes", description: "Alias of lengths", isExpression: true },
            { type: "str_strptime", label: "Strptime", description: "Parse to temporal", isExpression: true, presetProperties: { dtype: "Date", format: "%Y-%m-%d", strict: true, exact: true, cache: true } },
            { type: "str_decode", label: "Decode", description: "Decode to UTF-8", isExpression: true, presetProperties: { encoding: "utf-8", strict: true } }
        ]
    },
    {
        id: "series_datetime",
        name: "Series Datetime",
        icon: Calendar,
        items: [
            { type: "dt_year", label: "Year", description: "Extract year", isExpression: true },
            { type: "dt_month", label: "Month", description: "Extract month", isExpression: true },
            { type: "dt_day", label: "Day", description: "Extract day", isExpression: true },
            { type: "dt_hour", label: "Hour", description: "Extract hour", isExpression: true },
            { type: "dt_minute", label: "Minute", description: "Extract minute", isExpression: true },
            { type: "dt_second", label: "Second", description: "Extract second", isExpression: true },
            { type: "dt_millisecond", label: "Millisecond", description: "Extract millisecond", isExpression: true },
            { type: "dt_microsecond", label: "Microsecond", description: "Extract microsecond", isExpression: true },
            { type: "dt_nanosecond", label: "Nanosecond", description: "Extract nanosecond", isExpression: true },
            { type: "dt_weekday", label: "Weekday", description: "Day of week (Mon=0)", isExpression: true },
            { type: "dt_week", label: "Week", description: "ISO week number", isExpression: true },
            { type: "dt_ordinal_day", label: "Ordinal Day", description: "Day of year (1-366)", isExpression: true },
            { type: "dt_strftime", label: "Strftime", description: "Format to string", isExpression: true, presetProperties: { format: "%Y-%m-%d" } },
            { type: "dt_timestamp", label: "Timestamp", description: "Convert to timestamp", isExpression: true, presetProperties: { time_unit: "us" } },
            { type: "dt_epoch", label: "Epoch", description: "Alias of timestamp", isExpression: true, presetProperties: { time_unit: "us" } },
            { type: "dt_truncate", label: "Truncate", description: "Truncate to frequency", isExpression: true, presetProperties: { every: "1d", offset: null } },
            { type: "dt_round", label: "Round", description: "Round to frequency", isExpression: true, presetProperties: { every: "1d", offset: null } },
            { type: "dt_offset_by", label: "Offset By", description: "Offset by duration", isExpression: true, presetProperties: { by: "1d" } },
            { type: "dt_is_leap_year", label: "Is Leap Year", description: "Check leap year", isExpression: true },
            { type: "dt_days_in_month", label: "Days in Month", description: "Days in month", isExpression: true },
            { type: "dt_quarter", label: "Quarter", description: "Quarter (1-4)", isExpression: true }
        ]
    },
    {
        id: "series_lists",
        name: "Series Lists",
        icon: List,
        items: [
            { type: "arr_sum", label: "Arr Sum", description: "Sum of inner list", isExpression: true },
            { type: "arr_min", label: "Arr Min", description: "Min of inner list", isExpression: true },
            { type: "arr_max", label: "Arr Max", description: "Max of inner list", isExpression: true },
            { type: "arr_mean", label: "Arr Mean", description: "Mean of inner list", isExpression: true },
            { type: "arr_sort", label: "Arr Sort", description: "Sort inner list", isExpression: true, presetProperties: { descending: false, nulls_last: false } },
            { type: "arr_reverse", label: "Arr Reverse", description: "Reverse inner list", isExpression: true },
            { type: "arr_unique", label: "Arr Unique", description: "Unique in inner list", isExpression: true, presetProperties: { maintain_order: false } },
            { type: "arr_get", label: "Arr Get", description: "Get by index", isExpression: true, presetProperties: { index: 0, null_on_oob: false } },
            { type: "arr_first", label: "Arr First", description: "First element", isExpression: true },
            { type: "arr_last", label: "Arr Last", description: "Last element", isExpression: true },
            { type: "arr_contains", label: "Arr Contains", description: "Check if contains", isExpression: true, presetProperties: { item: null } },
            { type: "arr_join", label: "Arr Join", description: "Join to string", isExpression: true, presetProperties: { separator: ",", ignore_nulls: false } },
            { type: "arr_lengths", label: "Arr Lengths", description: "Length of inner list", isExpression: true },
            { type: "arr_explode", label: "Arr Explode", description: "Explode list", isExpression: true },
            { type: "arr_flatten", label: "Arr Flatten", description: "Flatten nested lists", isExpression: true },
            { type: "arr_arg_min", label: "Arr Arg Min", description: "Index of min", isExpression: true },
            { type: "arr_arg_max", label: "Arr Arg Max", description: "Index of max", isExpression: true },
            { type: "arr_shift", label: "Arr Shift", description: "Shift inner list", isExpression: true, presetProperties: { n: 1 } },
            { type: "arr_slice", label: "Arr Slice", description: "Slice inner list", isExpression: true, presetProperties: { offset: 0, length: null } },
            { type: "arr_to_struct", label: "Arr To Struct", description: "Convert to struct", isExpression: true, presetProperties: { fields: null, upper_bound: null } }
        ]
    },
    {
        id: "series_structs",
        name: "Series Structs",
        icon: Box,
        items: [
            { type: "struct_field", label: "Struct Field", description: "Extract field", isExpression: true, presetProperties: { name: "" } },
            { type: "struct_rename_fields", label: "Rename Fields", description: "Rename fields", isExpression: true, presetProperties: { names: "[]" } },
            { type: "struct_unnest", label: "Unnest", description: "Unnest to columns", isExpression: true },
            { type: "struct_json_encode", label: "JSON Encode", description: "Encode to JSON", isExpression: true }
        ]
    },
    {
        id: "series_bitwise",
        name: "Series Bitwise",
        icon: Ampersand,
        items: [
            { type: "bitwise_and", label: "Bitwise AND", description: "Bitwise AND reduction", isExpression: true },
            { type: "bitwise_or", label: "Bitwise OR", description: "Bitwise OR reduction", isExpression: true },
            { type: "bitwise_xor", label: "Bitwise XOR", description: "Bitwise XOR reduction", isExpression: true }
        ]
    }
];
