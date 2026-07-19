import type { PipelineExample, CanvasSetter, EdgesSetter } from "./index";

const IDS = {
    scan: "dag_sub_scan",
    subgraph: "dag_sub_group",
    filter: "dag_sub_filter",
    bin_eq: "dag_sub_bin_eq",
    col_status: "dag_sub_col_status",
    lit_active: "dag_sub_lit_active",
    with_cols: "dag_sub_with_cols",
    alias_date: "dag_sub_alias_date",
    call_todate: "dag_sub_call_todate",
    col_datestr: "dag_sub_col_datestr",
    sort: "dag_sub_sort",
    head: "dag_sub_head",
} as const;

export const dagSubgraphExample: PipelineExample = {
    id: "dag_subgraph",
    delayMs: 200,

    add: (setNodes: CanvasSetter, setEdges: EdgesSetter) => {
        setNodes((nds) => [
            ...nds,
            // 1. Source Node
            {
                id: IDS.scan,
                type: "astNode",
                position: { x: -300, y: 150 },
                data: {
                    nodeType: "scan",
                    label: "Scan",
                    properties: {
                        data: {
                            status: ["active", "inactive", "active", "active", "inactive"],
                            date_str: ["2023-01-01", "2023-02-15", "2023-03-20", "2023-04-10", "2023-05-05"],
                            user_id: [1, 2, 3, 4, 5],
                        }
                    },
                    stepIndex: -1,
                    isExpression: false,
                }
            },

            // 2. Subgraph Container (Macro)
            {
                id: IDS.subgraph,
                type: "groupNode",
                position: { x: 50, y: 50 },
                style: {
                    width: 700,
                    height: 400,
                },
                zIndex: -1,
                data: {
                    nodeType: "subgraph",
                    label: "Macro: Limpieza y Estandarización",
                    properties: {},
                    stepIndex: -1,
                    isExpression: false,
                }
            },

            // --- FILTER COMPONENT (inside subgraph) ---
            {
                id: IDS.filter,
                type: "astNode",
                parentNode: IDS.subgraph,
                extent: "parent",
                position: { x: 50, y: 50 },
                data: {
                    nodeType: "filter",
                    label: "Filter",
                    properties: {},
                    stepIndex: -1,
                    isExpression: false,
                }
            },
            {
                id: IDS.bin_eq,
                type: "astNode",
                parentNode: IDS.subgraph,
                extent: "parent",
                position: { x: 50, y: 150 },
                data: {
                    nodeType: "binary",
                    label: "BinaryOp(==)",
                    properties: { op: "==" },
                    stepIndex: -1,
                    isExpression: true,
                }
            },
            {
                id: IDS.col_status,
                type: "astNode",
                parentNode: IDS.subgraph,
                extent: "parent",
                position: { x: 20, y: 250 },
                data: {
                    nodeType: "col",
                    label: "Col(status)",
                    properties: { name: "status" },
                    stepIndex: -1,
                    isExpression: true,
                }
            },
            {
                id: IDS.lit_active,
                type: "astNode",
                parentNode: IDS.subgraph,
                extent: "parent",
                position: { x: 150, y: 250 },
                data: {
                    nodeType: "lit",
                    label: "Lit(\"active\")",
                    properties: { value: "active", dtype: "String" },
                    stepIndex: -1,
                    isExpression: true,
                }
            },

            // --- WITH_COLUMNS COMPONENT (inside subgraph) ---
            {
                id: IDS.with_cols,
                type: "astNode",
                parentNode: IDS.subgraph,
                extent: "parent",
                position: { x: 300, y: 50 },
                data: {
                    nodeType: "with_columns",
                    label: "WithColumns",
                    properties: {},
                    stepIndex: -1,
                    isExpression: false,
                }
            },
            {
                id: IDS.alias_date,
                type: "astNode",
                parentNode: IDS.subgraph,
                extent: "parent",
                position: { x: 300, y: 150 },
                data: {
                    nodeType: "alias",
                    label: "Alias(\"date_joined\")",
                    properties: { name: "date_joined" },
                    stepIndex: -1,
                    isExpression: true,
                }
            },
            {
                id: IDS.call_todate,
                type: "astNode",
                parentNode: IDS.subgraph,
                extent: "parent",
                position: { x: 300, y: 250 },
                data: {
                    nodeType: "cast",
                    label: "Cast(Date)",
                    properties: { dtype: "Date" },
                    stepIndex: -1,
                    isExpression: true,
                }
            },
            {
                id: IDS.col_datestr,
                type: "astNode",
                parentNode: IDS.subgraph,
                extent: "parent",
                position: { x: 300, y: 350 },
                data: {
                    nodeType: "col",
                    label: "Col(date_str)",
                    properties: { name: "date_str" },
                    stepIndex: -1,
                    isExpression: true,
                }
            },

            // 3. Output Branch 1 (Sort)
            {
                id: IDS.sort,
                type: "astNode",
                position: { x: 850, y: 80 },
                data: {
                    nodeType: "sort",
                    label: "Sort",
                    properties: { by: ["date_joined"], descending: true },
                    stepIndex: -1,
                    isExpression: false,
                }
            },

            // 4. Output Branch 2 (Head)
            {
                id: IDS.head,
                type: "astNode",
                position: { x: 850, y: 220 },
                data: {
                    nodeType: "head",
                    label: "Head",
                    properties: { n: 2 },
                    stepIndex: -1,
                    isExpression: false,
                }
            }
        ]);

        setEdges((eds) => [
            ...eds,
            // Main dataflow pipeline
            {
                id: `pipe_${IDS.scan}_${IDS.filter}`,
                source: IDS.scan,
                sourceHandle: "dataflow-out",
                target: IDS.filter,
                targetHandle: "dataflow-in",
                type: "smoothstep",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
            },
            {
                id: `pipe_${IDS.filter}_${IDS.with_cols}`,
                source: IDS.filter,
                sourceHandle: "dataflow-out",
                target: IDS.with_cols,
                targetHandle: "dataflow-in",
                type: "smoothstep",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
            },

            // Expression edges for Filter
            {
                id: `e_${IDS.filter}_${IDS.bin_eq}`,
                source: IDS.filter,
                sourceHandle: "predicate",
                target: IDS.bin_eq,
                targetHandle: "expr-in",
                type: "smoothstep",
                animated: true,
                style: { stroke: "#555", strokeWidth: 2 },
            },
            {
                id: `e_${IDS.bin_eq}_${IDS.col_status}`,
                source: IDS.bin_eq,
                sourceHandle: "left",
                target: IDS.col_status,
                targetHandle: "expr-in",
                type: "smoothstep",
                animated: true,
                style: { stroke: "#555", strokeWidth: 2 },
            },
            {
                id: `e_${IDS.bin_eq}_${IDS.lit_active}`,
                source: IDS.bin_eq,
                sourceHandle: "right",
                target: IDS.lit_active,
                targetHandle: "expr-in",
                type: "smoothstep",
                animated: true,
                style: { stroke: "#555", strokeWidth: 2 },
            },

            // Expression edges for WithColumns
            {
                id: `e_${IDS.with_cols}_${IDS.alias_date}`,
                source: IDS.with_cols,
                sourceHandle: "dataflow-out",
                target: IDS.alias_date,
                targetHandle: "expr-in",
                type: "smoothstep",
                animated: true,
                style: { stroke: "#555", strokeWidth: 2 },
            },
            {
                id: `e_${IDS.alias_date}_${IDS.call_todate}`,
                source: IDS.alias_date,
                sourceHandle: "expr",
                target: IDS.call_todate,
                targetHandle: "dataflow-in",
                type: "smoothstep",
                animated: true,
                style: { stroke: "#555", strokeWidth: 2 },
            },
            {
                id: `e_${IDS.call_todate}_${IDS.col_datestr}`,
                source: IDS.call_todate,
                sourceHandle: "dataflow-out",
                target: IDS.col_datestr,
                targetHandle: "expr-in",
                type: "smoothstep",
                animated: true,
                style: { stroke: "#555", strokeWidth: 2 },
            },

            // DAG Output Branches (Sort and Head)
            {
                id: `pipe_${IDS.with_cols}_${IDS.sort}`,
                source: IDS.with_cols,
                sourceHandle: "dataflow-out",
                target: IDS.sort,
                targetHandle: "dataflow-in",
                type: "smoothstep",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
            },
            {
                id: `pipe_${IDS.with_cols}_${IDS.head}`,
                source: IDS.with_cols,
                sourceHandle: "dataflow-out",
                target: IDS.head,
                targetHandle: "dataflow-in",
                type: "smoothstep",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
            }
        ]);
    },
};
