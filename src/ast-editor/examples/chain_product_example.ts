/**
 * First Chain example: 3 expressions joined with OR on product data.
 *
 * Each operand is a complete BinaryOp (col == lit), NOT a bare
 * ColRef or Literal.  The Chain then OR-s the three equalities:
 *
 *     ((product == "Widget") OR (revenue == 100)) OR (product == "Gadget")
 *
 * which matches every row where the product is "Widget" or
 * "Gadget" or the revenue is 100.  The dataset is intentionally
 * heterogeneous (string + numeric columns) to demonstrate that the
 * chain wrapper handles operands of different dtypes; the operator
 * can be flipped to ``&`` from the chain node's panel; the
 * serialized AST always uses the configured value.
 *
 * Layout:
 *
 *   Col(product)                  Lit("Widget")
 *        |                              │
 *        └───┐   ┌───────────────────────┘
 *            ▼   ▼
 *        BinaryOp(==,Widget)    Col(revenue)
 *            │                       │
 *            ▼                       │
 *                                   Lit(100)
 *                                    │
 *            │                       │
 *            ▼                       ▼
 *        BinaryOp(==,Revenue)   Col(product)
 *            │                       │
 *            │                       │
 *            ▼                       ▼
 *        BinaryOp(==,Gadget)   Lit("Gadget")
 *            │                       │
 *            └────┐  ┌────────────────┘
 *                 ▼  ▼
 *              Chain (OR)
 *                  │
 *                  ▼
 *              Filter  ←─ Scan (entry)
 *                  │
 *                  ▼
 *              Select
 */

import type { PipelineExample, CanvasSetter, EdgesSetter } from "./index";

const IDS = {
    scan: "ast_chain_scan",
    // BinaryOp nodes (one per equality)
    eqProduct: "ast_chain_eq_product",
    eqRevenue: "ast_chain_eq_revenue",
    eqGadget: "ast_chain_eq_gadget",
    // Columns used by the equalities
    colProduct1: "ast_chain_col_product_1",
    colRevenue: "ast_chain_col_revenue",
    colProduct2: "ast_chain_col_product_2",
    // Literals used by the equalities
    litWidget: "ast_chain_lit_widget",
    lit100: "ast_chain_lit_100",
    litGadget: "ast_chain_lit_gadget",
    chain: "ast_chain",
    filter: "ast_chain_filter",
} as const;

export const chainProductExample: PipelineExample = {
    id: "chain-product",
    delayMs: 200,

    add: (setNodes: CanvasSetter, setEdges: EdgesSetter) => {
        setNodes((nds) => [
            ...nds,
            // Scan entry point (leftmost column, own row).
            {
                id: IDS.scan,
                type: "astNode",
                position: { x: -300, y: 660 },
                data: {
                    nodeType: "scan",
                    label: "Scan",
                    properties: {
                        data: {
                            product: ["Widget", "Gadget"],
                            revenue: [100, 200],
                        },
                    },
                    stepIndex: -1,
                    isExpression: false,
                },
            },
            // 3 columns (one per equality) — column at x=80.
            {
                id: IDS.colProduct1,
                type: "astNode",
                position: { x: 80, y: 420 },
                data: {
                    nodeType: "col",
                    label: "Col(product)",
                    properties: { name: "product" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: IDS.colRevenue,
                type: "astNode",
                position: { x: 80, y: 660 },
                data: {
                    nodeType: "col",
                    label: "Col(revenue)",
                    properties: { name: "revenue" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: IDS.colProduct2,
                type: "astNode",
                position: { x: 80, y: 900 },
                data: {
                    nodeType: "col",
                    label: "Col(product)",
                    properties: { name: "product" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            // 3 literals (one per equality) — column at x=560, offset
            // to the right of the binary handles so the edges do not
            // overlap with the col→binary edges.
            {
                id: IDS.litWidget,
                type: "astNode",
                position: { x: 560, y: 420 },
                data: {
                    nodeType: "lit",
                    label: 'Lit("Widget")',
                    properties: { value: "Widget", dtype: "String" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: IDS.lit100,
                type: "astNode",
                position: { x: 560, y: 660 },
                data: {
                    nodeType: "lit",
                    label: "Lit(100)",
                    properties: { value: 100, dtype: "Int64" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: IDS.litGadget,
                type: "astNode",
                position: { x: 560, y: 900 },
                data: {
                    nodeType: "lit",
                    label: 'Lit("Gadget")',
                    properties: { value: "Gadget", dtype: "String" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            // 3 BinaryOps, one per equality — column at x=360.
            {
                id: IDS.eqProduct,
                type: "astNode",
                position: { x: 360, y: 480 },
                data: {
                    nodeType: "binary",
                    label: "product == \"Widget\"",
                    properties: { op: "==" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: IDS.eqRevenue,
                type: "astNode",
                position: { x: 360, y: 660 },
                data: {
                    nodeType: "binary",
                    label: "revenue == 100",
                    properties: { op: "==" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: IDS.eqGadget,
                type: "astNode",
                position: { x: 360, y: 840 },
                data: {
                    nodeType: "binary",
                    label: "product == \"Gadget\"",
                    properties: { op: "==" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            // Chain (the actual join)
            {
                id: IDS.chain,
                type: "astNode",
                position: { x: 660, y: 660 },
                data: {
                    nodeType: "chain",
                    label: "Chain (OR) · 3",
                    properties: { op: "|" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            // Filter (consumer of the chain) — the final step of the
            // pipeline.  The flow ends here so the user sees a clear
            // Scan → Filter shape with the chain feeding the filter's
            // predicate.  No ``select`` is added because an empty
            // select in Polars returns a zero-column frame and would
            // hide the data.
            {
                id: IDS.filter,
                type: "astNode",
                position: { x: 920, y: 660 },
                data: {
                    nodeType: "filter",
                    label: "Filter",
                    properties: {},
                    stepIndex: -1,
                    isExpression: false,
                },
            },
        ]);

        setEdges((eds) => [
            ...eds,
            // Scan → Filter (pipeline flow, top→top).  This is the
            // only dataflow edge; the filter is the final step.
            {
                id: `pipe_${IDS.scan}_${IDS.filter}`,
                source: IDS.scan,
                sourceHandle: "dataflow-out",
                target: IDS.filter,
                targetHandle: "dataflow-in",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
                type: "smoothstep",
            },
            // 3 BinaryOps → 3 columns (col is the LHS of every ==).
            {
                id: `e_${IDS.eqProduct}_${IDS.colProduct1}`,
                source: IDS.eqProduct,
                sourceHandle: "left",
                target: IDS.colProduct1,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            {
                id: `e_${IDS.eqRevenue}_${IDS.colRevenue}`,
                source: IDS.eqRevenue,
                sourceHandle: "left",
                target: IDS.colRevenue,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            {
                id: `e_${IDS.eqGadget}_${IDS.colProduct2}`,
                source: IDS.eqGadget,
                sourceHandle: "left",
                target: IDS.colProduct2,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            // 3 BinaryOps → 3 literals (lit is the RHS of every ==).
            {
                id: `e_${IDS.eqProduct}_${IDS.litWidget}`,
                source: IDS.eqProduct,
                sourceHandle: "right",
                target: IDS.litWidget,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            {
                id: `e_${IDS.eqRevenue}_${IDS.lit100}`,
                source: IDS.eqRevenue,
                sourceHandle: "right",
                target: IDS.lit100,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            {
                id: `e_${IDS.eqGadget}_${IDS.litGadget}`,
                source: IDS.eqGadget,
                sourceHandle: "right",
                target: IDS.litGadget,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            // Chain → 3 BinaryOps (chain is the source, points at each operand).
            {
                id: `e_${IDS.chain}_${IDS.eqProduct}`,
                source: IDS.chain,
                sourceHandle: "operand",
                target: IDS.eqProduct,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            {
                id: `e_${IDS.chain}_${IDS.eqRevenue}`,
                source: IDS.chain,
                sourceHandle: "operand",
                target: IDS.eqRevenue,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            {
                id: `e_${IDS.chain}_${IDS.eqGadget}`,
                source: IDS.chain,
                sourceHandle: "operand",
                target: IDS.eqGadget,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            // Filter → Chain (filter's predicate handle points at the chain).
            {
                id: `e_${IDS.filter}_${IDS.chain}`,
                source: IDS.filter,
                sourceHandle: "predicate",
                target: IDS.chain,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
        ]);
    },
};
