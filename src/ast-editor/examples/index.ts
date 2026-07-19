/**
 * Pipeline example library.
 *
 * Each example is a self-contained module that exports a function
 * which adds its nodes and edges to the canvas.  Examples are
 * self-contained and do not depend on each other, so the library can
 * be extended by dropping a new file into this directory and
 * importing it from the index.
 *
 * DRY: every example follows the same contract (``add`` method
 * that receives ``setNodes`` and ``setEdges`` callbacks), so the
 * canvas effect just iterates the library and calls them.
 */

import type { Node, Edge } from "reactflow";
import type { AstNodeData } from "../../shared/types/ast_types";

import { chainProductExample } from "./chain_product_example";
import { chainNationalitiesExample } from "./chain_nationalities_example";
import { SERIES_PIPELINE_EXAMPLES } from "./series_examples";
import { mlClusteringExample, mlClassificationExample } from "./ml_examples";
import { dagSubgraphExample } from "./dag_subgraph_example";

export type CanvasSetter = (
    updater: (nodes: Node<AstNodeData>[]) => Node<AstNodeData>[],
) => void;

export type EdgesSetter = (
    updater: (edges: Edge[]) => Edge[],
) => void;

export interface PipelineExample {
    /** Stable identifier, used as a key and for log messages. */
    id: string;
    /** When to inject the example (ms after mount).  Allows ordering. */
    delayMs: number;
    /** Inject the example's nodes and edges into the canvas. */
    add: (setNodes: CanvasSetter, setEdges: EdgesSetter) => void;
}

export const PIPELINE_EXAMPLES: PipelineExample[] = [
    chainProductExample,
    chainNationalitiesExample,
    ...SERIES_PIPELINE_EXAMPLES,
    mlClusteringExample,
    mlClassificationExample,
    dagSubgraphExample,
];
