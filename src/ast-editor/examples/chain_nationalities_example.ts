/**
 * Second Chain example: 4 expressions joined with OR on nacionalidades.
 *
 * Each operand is a complete ``col == "XX"`` BinaryOp, NOT a bare
 * ColRef or Literal.  The Chain then OR-s the four equalities:
 *
 *     ((col == "ES") OR (col == "MX")) OR (col == "AR") OR (col == "CO")
 *
 * which matches every row whose nacionalidad is one of the four —
 * useful as a pedagogical demo of how the wrapper serializes multiple
 * expressions joined by a single operator.  The pipeline is runnable
 * end-to-end and the operator can be flipped to ``&`` from the chain
 * node's panel; the serialized AST always uses the configured value.
 *
 * Layout:
 *
 *   Col(nacionalidad)                 Lit("ES")
 *           |                              │
 *           └───┐   ┌───────────────────────┘
 *               ▼   ▼
 *           BinaryOp(==, ES)    Lit("MX")
 *               │                  │
 *               └────┐  ┌──────────┘
 *                    ▼  ▼
 *                BinaryOp(==, MX)   Lit("AR")
 *                    │                 │
 *                    └─────┐  ┌────────┘
 *                          ▼  ▼
 *                    BinaryOp(==, AR)   Lit("CO")
 *                          │                │
 *                          └────┐  ┌────────┘
 *                                ▼  ▼
 *                            BinaryOp(==, CO)
 *                                    │
 *                                    ▼
 *                               Chain (OR)
 *                                    │
 *                                    ▼
 *                                Filter  ←─ Scan (entry)
 */

import type { PipelineExample, CanvasSetter, EdgesSetter } from "./index";

const IDS = {
    scan: "ast_nat_scan",
    col: "ast_nat_col",
    // BinaryOp nodes (one per equality)
    eqEs: "ast_nat_eq_es",
    eqMx: "ast_nat_eq_mx",
    eqAr: "ast_nat_eq_ar",
    eqCo: "ast_nat_eq_co",
    // Literals referenced by the equalities
    litEs: "ast_nat_lit_es",
    litMx: "ast_nat_lit_mx",
    litAr: "ast_nat_lit_ar",
    litCo: "ast_nat_lit_co",
    chain: "ast_nat_chain",
    filter: "ast_nat_filter",
} as const;

export const chainNationalitiesExample: PipelineExample = {
    id: "chain-nationalities",
    delayMs: 400,

    add: (setNodes: CanvasSetter, setEdges: EdgesSetter) => {
        setNodes((nds) => [
            ...nds,
            // Scan entry point
            {
                id: IDS.scan,
                type: "astNode",
                position: { x: 80, y: 860 },
                data: {
                    nodeType: "scan",
                    label: "Scan",
                    properties: {
                        data: {
                            nacionalidad: ["ES", "MX", "AR", "CO", "US"],
                        },
                    },
                    stepIndex: -1,
                    isExpression: false,
                },
            },
            // Shared column reference (input to every equality)
            {
                id: IDS.col,
                type: "astNode",
                position: { x: 80, y: 1040 },
                data: {
                    nodeType: "col",
                    label: "Col(nacionalidad)",
                    properties: { name: "nacionalidad" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            // 4 literals (one per equality)
            {
                id: IDS.litEs,
                type: "astNode",
                position: { x: 80, y: 760 },
                data: {
                    nodeType: "lit",
                    label: 'Lit("ES")',
                    properties: { value: "ES", dtype: "String" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: IDS.litMx,
                type: "astNode",
                position: { x: 80, y: 900 },
                data: {
                    nodeType: "lit",
                    label: 'Lit("MX")',
                    properties: { value: "MX", dtype: "String" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: IDS.litAr,
                type: "astNode",
                position: { x: 80, y: 1180 },
                data: {
                    nodeType: "lit",
                    label: 'Lit("AR")',
                    properties: { value: "AR", dtype: "String" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: IDS.litCo,
                type: "astNode",
                position: { x: 80, y: 1320 },
                data: {
                    nodeType: "lit",
                    label: 'Lit("CO")',
                    properties: { value: "CO", dtype: "String" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            // 4 BinaryOps, one per equality
            {
                id: IDS.eqEs,
                type: "astNode",
                position: { x: 360, y: 900 },
                data: {
                    nodeType: "binary",
                    label: "==",
                    properties: { op: "==" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: IDS.eqMx,
                type: "astNode",
                position: { x: 360, y: 1040 },
                data: {
                    nodeType: "binary",
                    label: "==",
                    properties: { op: "==" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: IDS.eqAr,
                type: "astNode",
                position: { x: 360, y: 1180 },
                data: {
                    nodeType: "binary",
                    label: "==",
                    properties: { op: "==" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            {
                id: IDS.eqCo,
                type: "astNode",
                position: { x: 360, y: 1320 },
                data: {
                    nodeType: "binary",
                    label: "==",
                    properties: { op: "==" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            // Chain (the actual join)
            {
                id: IDS.chain,
                type: "astNode",
                position: { x: 660, y: 1110 },
                data: {
                    nodeType: "chain",
                    label: "Chain (OR) · 4",
                    properties: { op: "|" },
                    stepIndex: -1,
                    isExpression: true,
                },
            },
            // Filter (consumer of the chain)
            {
                id: IDS.filter,
                type: "astNode",
                position: { x: 920, y: 1110 },
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
            // Scan → Filter (pipeline flow, top→top).
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
            // 4 BinaryOps → Col(nacionalidad) (col is the LHS, binary is the source).
            {
                id: `e_${IDS.eqEs}_${IDS.col}`,
                source: IDS.eqEs,
                sourceHandle: "left",
                target: IDS.col,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            {
                id: `e_${IDS.eqMx}_${IDS.col}`,
                source: IDS.eqMx,
                sourceHandle: "left",
                target: IDS.col,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            {
                id: `e_${IDS.eqAr}_${IDS.col}`,
                source: IDS.eqAr,
                sourceHandle: "left",
                target: IDS.col,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            {
                id: `e_${IDS.eqCo}_${IDS.col}`,
                source: IDS.eqCo,
                sourceHandle: "left",
                target: IDS.col,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            // 4 BinaryOps → 4 literals (binary is the source, lit is the target).
            {
                id: `e_${IDS.eqEs}_${IDS.litEs}`,
                source: IDS.eqEs,
                sourceHandle: "right",
                target: IDS.litEs,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            {
                id: `e_${IDS.eqMx}_${IDS.litMx}`,
                source: IDS.eqMx,
                sourceHandle: "right",
                target: IDS.litMx,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            {
                id: `e_${IDS.eqAr}_${IDS.litAr}`,
                source: IDS.eqAr,
                sourceHandle: "right",
                target: IDS.litAr,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            {
                id: `e_${IDS.eqCo}_${IDS.litCo}`,
                source: IDS.eqCo,
                sourceHandle: "right",
                target: IDS.litCo,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            // Chain → 4 BinaryOps (chain is the source, points at each operand).
            {
                id: `e_${IDS.chain}_${IDS.eqEs}`,
                source: IDS.chain,
                sourceHandle: "operand",
                target: IDS.eqEs,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            {
                id: `e_${IDS.chain}_${IDS.eqMx}`,
                source: IDS.chain,
                sourceHandle: "operand",
                target: IDS.eqMx,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            {
                id: `e_${IDS.chain}_${IDS.eqAr}`,
                source: IDS.chain,
                sourceHandle: "operand",
                target: IDS.eqAr,
                targetHandle: "expr-in",
                animated: true,
                style: { stroke: "#555555", strokeWidth: 2 },
                type: "smoothstep",
            },
            {
                id: `e_${IDS.chain}_${IDS.eqCo}`,
                source: IDS.chain,
                sourceHandle: "operand",
                target: IDS.eqCo,
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
