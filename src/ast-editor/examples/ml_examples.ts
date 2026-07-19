import type { PipelineExample, CanvasSetter, EdgesSetter } from "./index";

const CLUSTERING_IDS = {
    scan: "ml_clust_scan",
    kmeans: "ml_clust_kmeans",
    scatter: "ml_clust_scatter"
} as const;

export const mlClusteringExample: PipelineExample = {
    id: "ml-clustering",
    delayMs: 200,

    add: (setNodes: CanvasSetter, setEdges: EdgesSetter) => {
        setNodes((nds) => [
            ...nds,
            {
                id: CLUSTERING_IDS.scan,
                type: "astNode",
                position: { x: 100, y: 100 },
                data: {
                    nodeType: "scan",
                    label: "Scan",
                    properties: {
                        data: {
                            edad: [25, 30, 45, 50, 22, 28, 60, 65],
                            ingresos: [3000, 3200, 6000, 6500, 2800, 3100, 8000, 8500],
                        }
                    },
                    stepIndex: -1,
                    isExpression: false,
                },
            },
            {
                id: CLUSTERING_IDS.kmeans,
                type: "astNode",
                position: { x: 400, y: 100 },
                data: {
                    nodeType: "kmeans",
                    label: "KMeans",
                    properties: {
                        n_clusters: 3,
                        feature_columns: ["edad", "ingresos"],
                    },
                    stepIndex: -1,
                    isExpression: false,
                },
            },
            {
                id: CLUSTERING_IDS.scatter,
                type: "astNode",
                position: { x: 700, y: 100 },
                data: {
                    nodeType: "bokeh_scatter",
                    label: "Bokeh Scatter",
                    properties: {
                        x: "edad",
                        y: "ingresos",
                        color_column: "cluster"
                    },
                    stepIndex: -1,
                    isExpression: false,
                },
            },
        ]);

        setEdges((eds) => [
            ...eds,
            {
                id: `pipe_${CLUSTERING_IDS.scan}_${CLUSTERING_IDS.kmeans}`,
                source: CLUSTERING_IDS.scan,
                sourceHandle: "dataflow-out",
                target: CLUSTERING_IDS.kmeans,
                targetHandle: "dataflow-in",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
                type: "smoothstep",
            },
            {
                id: `pipe_${CLUSTERING_IDS.kmeans}_${CLUSTERING_IDS.scatter}`,
                source: CLUSTERING_IDS.kmeans,
                sourceHandle: "dataflow-out",
                target: CLUSTERING_IDS.scatter,
                targetHandle: "dataflow-in",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
                type: "smoothstep",
            },
        ]);
    },
};

const CLASSIFICATION_IDS = {
    scan: "ml_class_scan",
    logistic: "ml_class_logistic",
    confusion: "ml_class_confusion"
} as const;

export const mlClassificationExample: PipelineExample = {
    id: "ml-classification",
    delayMs: 200,

    add: (setNodes: CanvasSetter, setEdges: EdgesSetter) => {
        setNodes((nds) => [
            ...nds,
            {
                id: CLASSIFICATION_IDS.scan,
                type: "astNode",
                position: { x: 100, y: 100 },
                data: {
                    nodeType: "scan",
                    label: "Scan",
                    properties: {
                        data: {
                            monto: [10, 500, 20, 800, 15],
                            hora: [1, 23, 14, 2, 9],
                            es_fraude: [0, 1, 0, 1, 0]
                        }
                    },
                    stepIndex: -1,
                    isExpression: false,
                },
            },
            {
                id: CLASSIFICATION_IDS.logistic,
                type: "astNode",
                position: { x: 400, y: 100 },
                data: {
                    nodeType: "logistic_regression",
                    label: "LogisticRegression",
                    properties: {
                        feature_columns: ["monto", "hora"],
                        target_column: "es_fraude"
                    },
                    stepIndex: -1,
                    isExpression: false,
                },
            },
            {
                id: CLASSIFICATION_IDS.confusion,
                type: "astNode",
                position: { x: 700, y: 100 },
                data: {
                    nodeType: "bokeh_confusion_matrix",
                    label: "Confusion Matrix",
                    properties: {
                        y_true: "es_fraude",
                        y_pred: "prediction"
                    },
                    stepIndex: -1,
                    isExpression: false,
                },
            },
        ]);

        setEdges((eds) => [
            ...eds,
            {
                id: `pipe_${CLASSIFICATION_IDS.scan}_${CLASSIFICATION_IDS.logistic}`,
                source: CLASSIFICATION_IDS.scan,
                sourceHandle: "dataflow-out",
                target: CLASSIFICATION_IDS.logistic,
                targetHandle: "dataflow-in",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
                type: "smoothstep",
            },
            {
                id: `pipe_${CLASSIFICATION_IDS.logistic}_${CLASSIFICATION_IDS.confusion}`,
                source: CLASSIFICATION_IDS.logistic,
                sourceHandle: "dataflow-out",
                target: CLASSIFICATION_IDS.confusion,
                targetHandle: "dataflow-in",
                animated: true,
                style: { stroke: "#ff6d5a", strokeWidth: 3 },
                type: "smoothstep",
            },
        ]);
    },
};
