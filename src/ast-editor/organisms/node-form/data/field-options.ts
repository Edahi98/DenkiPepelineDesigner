/**
 * Named option lists for select fields in NODE_FORM_SCHEMAS. Each one
 * used to be an inline array literal at its single call site — pulling
 * them out here means the schema itself reads as "field X has options
 * Y" instead of interleaving structure with hardcoded data.
 */

export const BINARY_OPERATORS = ["+", "-", "*", "/", "//", "%", "**", "==", "!=", "<", "<=", ">", ">=", "&", "|", "^"];
export const UNARY_OPERATORS = ["negate", "not"];
export const JOIN_HOW_OPTIONS = ["inner", "left", "outer", "cross", "semi", "anti"];
export const FILL_NULL_STRATEGY_OPTIONS = ["", "forward", "backward", "min", "max", "mean", "zero", "one"];
export const UNIQUE_KEEP_OPTIONS = ["any", "first", "last", "none"];
export const ROUND_MODE_OPTIONS = ["", "half_away_from_zero", "half_to_even"];
export const QUANTILE_INTERPOLATION_OPTIONS = ["nearest", "higher", "lower", "midpoint", "linear"];
export const INTERPOLATE_METHOD_OPTIONS = ["linear", "nearest"];
export const RANK_METHOD_OPTIONS = ["average", "min", "max", "dense", "ordinal", "random"];
export const IS_BETWEEN_CLOSED_OPTIONS = ["both", "left", "right", "none"];
export const STRPTIME_DTYPE_OPTIONS = ["Date", "Datetime", "Time"];
export const STR_DECODE_ENCODING_OPTIONS = ["utf-8", "ascii", "latin1"];
export const TIME_UNIT_OPTIONS = ["ns", "us", "ms"];
export const ROLLING_CLOSED_OPTIONS = ["right", "left", "both", "none"];
export const SVC_KERNEL_OPTIONS = ["linear", "poly", "rbf", "sigmoid"];
export const SGD_LOSS_OPTIONS = ["hinge", "log_loss", "modified_huber", "squared_hinge", "perceptron"];
