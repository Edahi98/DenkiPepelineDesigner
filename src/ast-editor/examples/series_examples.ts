/**
 * Series AST pipeline examples for the visual editor.
 *
 * These examples demonstrate how to use Series nodes in pipelines.
 * Each example shows a common use case with Series operations.
 */

import type { PipelineExample, CanvasSetter, EdgesSetter } from "./index";

/**
 * Example 1: Numeric cleaning pipeline
 *
 * Chain: get_column("x") ← fill_null(0) ← abs() ← round(2)
 *
 * This example demonstrates:
 * - Extracting a column from a DataFrame
 * - Filling null values with 0
 * - Taking absolute values
 * - Rounding to 2 decimal places
 */
export const seriesNumericCleaningExample: PipelineExample = {
    id: "series-numeric-cleaning",
    delayMs: 100,
    add: (setNodes: CanvasSetter, setEdges: EdgesSetter) => {
        setNodes((nds) => [
            ...nds,
            {
                id: "series_scan_1",
                type: "astNode",
                position: { x: 100, y: 100 },
                data: {
                    nodeType: "scan",
                    label: "Scan",
                    properties: { data: { x: [-1.5, null, 2.8, -3.1] } },
                    stepIndex: 0,
                    isExpression: false,
                },
            },
            {
                id: "series_gc_1",
                type: "astNode",
                position: { x: 100, y: 250 },
                data: {
                    nodeType: "get_column",
                    label: "GetColumn(x)",
                    properties: { name: "x" },
                    stepIndex: 1,
                    isExpression: true,
                },
            },
            {
                id: "series_fill_1",
                type: "astNode",
                position: { x: 400, y: 250 },
                data: {
                    nodeType: "fill_null",
                    label: "FillNull(0)",
                    properties: { value: 0 },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: "series_abs_1",
                type: "astNode",
                position: { x: 700, y: 250 },
                data: {
                    nodeType: "abs",
                    label: "Abs",
                    properties: {},
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: "series_round_1",
                type: "astNode",
                position: { x: 1000, y: 250 },
                data: {
                    nodeType: "round",
                    label: "Round(2)",
                    properties: { decimals: 2 },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
        ]);

        setEdges((eds) => [
            ...eds,
            {
                id: "e_scan_gc_1",
                source: "series_scan_1",
                sourceHandle: "dataflow-out",
                target: "series_gc_1",
                targetHandle: "patterns_series",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
                type: "smoothstep",
            },
            {
                id: "e_round_abs_1",
                source: "series_round_1",
                sourceHandle: "expr",
                target: "series_abs_1",
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#a855f7", strokeWidth: 3 },
                type: "smoothstep",
            },
            {
                id: "e_abs_fill_1",
                source: "series_abs_1",
                sourceHandle: "expr",
                target: "series_fill_1",
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#a855f7", strokeWidth: 3 },
                type: "smoothstep",
            },
            {
                id: "e_fill_gc_1",
                source: "series_fill_1",
                sourceHandle: "expr",
                target: "series_gc_1",
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#a855f7", strokeWidth: 3 },
                type: "smoothstep",
            },
        ]);
    },
};

/**
 * Example 2: String normalization pipeline
 *
 * Chain: get_column("text") ← str_strip() ← str_to_lowercase() ← str_lengths()
 */
export const seriesStringNormalizationExample: PipelineExample = {
    id: "series-string-normalization",
    delayMs: 200,
    add: (setNodes: CanvasSetter, setEdges: EdgesSetter) => {
        setNodes((nds) => [
            ...nds,
            {
                id: "series_scan_2",
                type: "astNode",
                position: { x: 400, y: 100 },
                data: {
                    nodeType: "scan",
                    label: "Scan",
                    properties: { data: { text: ["  HELLO  ", "world", "  Test"] } },
                    stepIndex: 0,
                    isExpression: false,
                },
            },
            {
                id: "series_gc_2",
                type: "astNode",
                position: { x: 400, y: 250 },
                data: {
                    nodeType: "get_column",
                    label: "GetColumn(text)",
                    properties: { name: "text" },
                    stepIndex: 1,
                    isExpression: true,
                },
            },
            {
                id: "series_strip_2",
                type: "astNode",
                position: { x: 700, y: 250 },
                data: {
                    nodeType: "str_strip",
                    label: "StrStrip",
                    properties: {},
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: "series_lower_2",
                type: "astNode",
                position: { x: 1000, y: 250 },
                data: {
                    nodeType: "str_to_lowercase",
                    label: "StrLowercase",
                    properties: {},
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: "series_len_2",
                type: "astNode",
                position: { x: 1300, y: 250 },
                data: {
                    nodeType: "str_lengths",
                    label: "StrLengths",
                    properties: {},
                    stepIndex: -1,
                    isExpression: true,
                },
            },
        ]);

        setEdges((eds) => [
            ...eds,
            {
                id: "e_scan_gc_2",
                source: "series_scan_2",
                sourceHandle: "dataflow-out",
                target: "series_gc_2",
                targetHandle: "patterns_series",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
                type: "smoothstep",
            },
            {
                id: "e_len_lower_2",
                source: "series_len_2",
                sourceHandle: "expr",
                target: "series_lower_2",
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#a855f7", strokeWidth: 3 },
                type: "smoothstep",
            },
            {
                id: "e_lower_strip_2",
                source: "series_lower_2",
                sourceHandle: "expr",
                target: "series_strip_2",
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#a855f7", strokeWidth: 3 },
                type: "smoothstep",
            },
            {
                id: "e_strip_gc_2",
                source: "series_strip_2",
                sourceHandle: "expr",
                target: "series_gc_2",
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#a855f7", strokeWidth: 3 },
                type: "smoothstep",
            },
        ]);
    },
};

/**
 * Example 3: Datetime extraction pipeline
 *
 * Chain: get_column("date") ← dt_year()
 */
export const seriesDatetimeExtractionExample: PipelineExample = {
    id: "series-datetime-extraction",
    delayMs: 300,
    add: (setNodes: CanvasSetter, setEdges: EdgesSetter) => {
        setNodes((nds) => [
            ...nds,
            {
                id: "series_scan_3",
                type: "astNode",
                position: { x: 700, y: 100 },
                data: {
                    nodeType: "scan",
                    label: "Scan",
                    properties: { data: { date: ["2023-01-01", "2023-05-15", "2024-12-31"] } },
                    stepIndex: 0,
                    isExpression: false,
                },
            },
            {
                id: "series_gc_3",
                type: "astNode",
                position: { x: 700, y: 250 },
                data: {
                    nodeType: "get_column",
                    label: "GetColumn(date)",
                    properties: { name: "date" },
                    stepIndex: 1,
                    isExpression: true,
                },
            },
            {
                id: "series_year_3",
                type: "astNode",
                position: { x: 1000, y: 250 },
                data: {
                    nodeType: "dt_year",
                    label: "DtYear",
                    properties: {},
                    stepIndex: -1,
                    isExpression: true,
                },
            },
        ]);

        setEdges((eds) => [
            ...eds,
            {
                id: "e_scan_gc_3",
                source: "series_scan_3",
                sourceHandle: "dataflow-out",
                target: "series_gc_3",
                targetHandle: "patterns_series",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
                type: "smoothstep",
            },
            {
                id: "e_year_gc_3",
                source: "series_year_3",
                sourceHandle: "expr",
                target: "series_gc_3",
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#a855f7", strokeWidth: 3 },
                type: "smoothstep",
            },
        ]);
    },
};

/**
 * Example 4: Cumulative sum pipeline
 *
 * Chain: get_column("value") ← cum_sum()
 */
export const seriesCumulativeSumExample: PipelineExample = {
    id: "series-cumulative-sum",
    delayMs: 400,
    add: (setNodes: CanvasSetter, setEdges: EdgesSetter) => {
        setNodes((nds) => [
            ...nds,
            {
                id: "series_scan_4",
                type: "astNode",
                position: { x: 1000, y: 100 },
                data: {
                    nodeType: "scan",
                    label: "Scan",
                    properties: { data: { value: [1, 2, 3, 4, 5] } },
                    stepIndex: 0,
                    isExpression: false,
                },
            },
            {
                id: "series_gc_4",
                type: "astNode",
                position: { x: 1000, y: 250 },
                data: {
                    nodeType: "get_column",
                    label: "GetColumn(value)",
                    properties: { name: "value" },
                    stepIndex: 1,
                    isExpression: true,
                },
            },
            {
                id: "series_cumsum_4",
                type: "astNode",
                position: { x: 1300, y: 250 },
                data: {
                    nodeType: "cum_sum",
                    label: "CumSum",
                    properties: {},
                    stepIndex: -1,
                    isExpression: true,
                },
            },
        ]);

        setEdges((eds) => [
            ...eds,
            {
                id: "e_scan_gc_4",
                source: "series_scan_4",
                sourceHandle: "dataflow-out",
                target: "series_gc_4",
                targetHandle: "patterns_series",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
                type: "smoothstep",
            },
            {
                id: "e_cumsum_gc_4",
                source: "series_cumsum_4",
                sourceHandle: "expr",
                target: "series_gc_4",
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#a855f7", strokeWidth: 3 },
                type: "smoothstep",
            },
        ]);
    },
};

/**
 * Example 5: Rolling mean pipeline
 *
 * Chain: get_column("value") ← rolling_mean(window_size=3)
 */
export const seriesRollingMeanExample: PipelineExample = {
    id: "series-rolling-mean",
    delayMs: 500,
    add: (setNodes: CanvasSetter, setEdges: EdgesSetter) => {
        setNodes((nds) => [
            ...nds,
            {
                id: "series_scan_5",
                type: "astNode",
                position: { x: 1300, y: 100 },
                data: {
                    nodeType: "scan",
                    label: "Scan",
                    properties: { data: { value: [10, 20, 30, 40, 50] } },
                    stepIndex: 0,
                    isExpression: false,
                },
            },
            {
                id: "series_gc_5",
                type: "astNode",
                position: { x: 1300, y: 250 },
                data: {
                    nodeType: "get_column",
                    label: "GetColumn(value)",
                    properties: { name: "value" },
                    stepIndex: 1,
                    isExpression: true,
                },
            },
            {
                id: "series_rolling_5",
                type: "astNode",
                position: { x: 1600, y: 250 },
                data: {
                    nodeType: "rolling_mean",
                    label: "RollingMean(3)",
                    properties: { window_size: 3 },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
        ]);

        setEdges((eds) => [
            ...eds,
            {
                id: "e_scan_gc_5",
                source: "series_scan_5",
                sourceHandle: "dataflow-out",
                target: "series_gc_5",
                targetHandle: "patterns_series",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
                type: "smoothstep",
            },
            {
                id: "e_rolling_gc_5",
                source: "series_rolling_5",
                sourceHandle: "expr",
                target: "series_gc_5",
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#a855f7", strokeWidth: 3 },
                type: "smoothstep",
            },
        ]);
    },
};

/**
 * Example 6: Array operations pipeline
 *
 * Chain: get_column("tags") ← arr_lengths()
 */
export const seriesArrayLengthsExample: PipelineExample = {
    id: "series-array-lengths",
    delayMs: 600,
    add: (setNodes: CanvasSetter, setEdges: EdgesSetter) => {
        setNodes((nds) => [
            ...nds,
            {
                id: "series_scan_6",
                type: "astNode",
                position: { x: 1600, y: 100 },
                data: {
                    nodeType: "scan",
                    label: "Scan",
                    properties: { data: { tags: [[1, 2], [3], [4, 5, 6]] } },
                    stepIndex: 0,
                    isExpression: false,
                },
            },
            {
                id: "series_gc_6",
                type: "astNode",
                position: { x: 1600, y: 250 },
                data: {
                    nodeType: "get_column",
                    label: "GetColumn(tags)",
                    properties: { name: "tags" },
                    stepIndex: 1,
                    isExpression: true,
                },
            },
            {
                id: "series_arrlen_6",
                type: "astNode",
                position: { x: 1900, y: 250 },
                data: {
                    nodeType: "arr_lengths",
                    label: "ArrLengths",
                    properties: {},
                    stepIndex: -1,
                    isExpression: true,
                },
            },
        ]);

        setEdges((eds) => [
            ...eds,
            {
                id: "e_scan_gc_6",
                source: "series_scan_6",
                sourceHandle: "dataflow-out",
                target: "series_gc_6",
                targetHandle: "patterns_series",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
                type: "smoothstep",
            },
            {
                id: "e_arrlen_gc_6",
                source: "series_arrlen_6",
                sourceHandle: "expr",
                target: "series_gc_6",
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#a855f7", strokeWidth: 3 },
                type: "smoothstep",
            },
        ]);
    },
};

/**
 * Example 7: Statistical aggregation pipeline
 *
 * Chain: get_column("value") ← mean()
 */
export const seriesMeanExample: PipelineExample = {
    id: "series-mean",
    delayMs: 700,
    add: (setNodes: CanvasSetter, setEdges: EdgesSetter) => {
        setNodes((nds) => [
            ...nds,
            {
                id: "series_scan_7",
                type: "astNode",
                position: { x: 1900, y: 100 },
                data: {
                    nodeType: "scan",
                    label: "Scan",
                    properties: { data: { value: [10, 20, 30, 40] } },
                    stepIndex: 0,
                    isExpression: false,
                },
            },
            {
                id: "series_gc_7",
                type: "astNode",
                position: { x: 1900, y: 250 },
                data: {
                    nodeType: "get_column",
                    label: "GetColumn(value)",
                    properties: { name: "value" },
                    stepIndex: 1,
                    isExpression: true,
                },
            },
            {
                id: "series_mean_7",
                type: "astNode",
                position: { x: 2200, y: 250 },
                data: {
                    nodeType: "mean",
                    label: "Mean",
                    properties: {},
                    stepIndex: -1,
                    isExpression: true,
                },
            },
        ]);

        setEdges((eds) => [
            ...eds,
            {
                id: "e_scan_gc_7",
                source: "series_scan_7",
                sourceHandle: "dataflow-out",
                target: "series_gc_7",
                targetHandle: "patterns_series",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
                type: "smoothstep",
            },
            {
                id: "e_mean_gc_7",
                source: "series_mean_7",
                sourceHandle: "expr",
                target: "series_gc_7",
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#a855f7", strokeWidth: 3 },
                type: "smoothstep",
            },
        ]);
    },
};

/**
 * Example 8: Shift and diff pipeline
 *
 * Chain: get_column("value") ← shift(n=1) ← diff(n=1)
 */
export const seriesShiftDiffExample: PipelineExample = {
    id: "series-shift-diff",
    delayMs: 800,
    add: (setNodes: CanvasSetter, setEdges: EdgesSetter) => {
        setNodes((nds) => [
            ...nds,
            {
                id: "series_scan_8",
                type: "astNode",
                position: { x: 2200, y: 100 },
                data: {
                    nodeType: "scan",
                    label: "Scan",
                    properties: { data: { value: [10, 15, 14, 20] } },
                    stepIndex: 0,
                    isExpression: false,
                },
            },
            {
                id: "series_gc_8",
                type: "astNode",
                position: { x: 2200, y: 250 },
                data: {
                    nodeType: "get_column",
                    label: "GetColumn(value)",
                    properties: { name: "value" },
                    stepIndex: 1,
                    isExpression: true,
                },
            },
            {
                id: "series_shift_8",
                type: "astNode",
                position: { x: 2500, y: 250 },
                data: {
                    nodeType: "shift",
                    label: "Shift(1)",
                    properties: { n: 1 },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: "series_diff_8",
                type: "astNode",
                position: { x: 2800, y: 250 },
                data: {
                    nodeType: "diff",
                    label: "Diff(1)",
                    properties: { n: 1 },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
        ]);

        setEdges((eds) => [
            ...eds,
            {
                id: "e_scan_gc_8",
                source: "series_scan_8",
                sourceHandle: "dataflow-out",
                target: "series_gc_8",
                targetHandle: "patterns_series",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
                type: "smoothstep",
            },
            {
                id: "e_diff_shift_8",
                source: "series_diff_8",
                sourceHandle: "expr",
                target: "series_shift_8",
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#a855f7", strokeWidth: 3 },
                type: "smoothstep",
            },
            {
                id: "e_shift_gc_8",
                source: "series_shift_8",
                sourceHandle: "expr",
                target: "series_gc_8",
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#a855f7", strokeWidth: 3 },
                type: "smoothstep",
            },
        ]);
    },
};

/**
 * All Series pipeline examples
 */
export const SERIES_PIPELINE_EXAMPLES: PipelineExample[] = [
    seriesNumericCleaningExample,
    seriesStringNormalizationExample,
    seriesDatetimeExtractionExample,
    seriesCumulativeSumExample,
    seriesRollingMeanExample,
    seriesArrayLengthsExample,
    seriesMeanExample,
    seriesShiftDiffExample,
];
