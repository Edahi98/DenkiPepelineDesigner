/**
 * Pure helpers that build AST JSON for nodes whose visual representation
 * has N children but the underlying AST only supports a fixed arity.
 *
 * The AST parser (``src/ast/parser.py``) is recursive, so a chain of
 * ``BinaryOp`` nodes left-associated is a perfectly valid pipeline
 * step.  These wrappers turn N flat operands into a nested tree
 * without changing anything on the backend.
 *
 * Single Responsibility: each helper does one thing.
 * DRY: the construction strategy lives in exactly one place.
 * Open/Closed: extending with a new operator means widening the
 * ``op`` union, not editing any consumer of these helpers.
 */

export type ChainOp = "|" | "&";

/** Minimal shape of an AST expression node (subset of ``PipelineStep``). */
export interface ExprNodeLike {
    type: string;
    [key: string]: unknown;
}

/**
 * Builds a left-associative chain of ``BinaryOp`` nodes from a flat
 * list of operands and a single operator.
 *
 * Example with ``op="|"`` and ``operands=[a, b, c, d]``:
 *
 *     {
 *       type: "binary", op: "|",
 *       left:  { type: "binary", op: "|",
 *                left:  { type: "binary", op: "|",
 *                         left: a, right: b },
 *                right: c },
 *       right: d,
 *     }
 *
 * This is fully valid for the existing AST parser.  The result is
 * left-associative, matching how Polars and SQL interpret chained
 * boolean operators.
 *
 * Throws if the operand list is empty.
 */
export function buildBinaryOpChain(
    op: ChainOp,
    operands: ExprNodeLike[],
): ExprNodeLike {
    if (operands.length === 0) {
        throw new Error("buildBinaryOpChain requires at least one operand");
    }
    if (operands.length === 1) {
        return operands[0];
    }
    return {
        type: "binary",
        op,
        left: buildBinaryOpChain(op, operands.slice(0, -1)),
        right: operands[operands.length - 1],
    };
}
