import React, { useState } from "react";
import { ReactFlow, Background, MarkerType, type Node, type Edge } from "reactflow";
import "reactflow/dist/style.css";
import { Info, BarChart2, BrainCircuit, Network } from "lucide-react";

type MLTab = "clustering" | "classification" | "reduction";

export const MLFlowExample: React.FC = () => {
    const [activeTab, setActiveTab] = useState<MLTab>("clustering");

    // Reusable Node Styles
    const baseNodeStyle = { width: 170, background: 'rgba(15,23,42,0.95)', color: 'white', borderRadius: 8, padding: '10px 12px', fontSize: 10, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' };
    const blueBorder = { ...baseNodeStyle, border: '1px solid #2563eb' };
    const cyanBorder = { ...baseNodeStyle, border: '1px solid #0891b2' };
    const purpleBorder = { ...baseNodeStyle, border: '1px solid #7e22ce' };

    // --- Clustering Nodes & Edges ---
    const clusteringNodes: Node[] = [
        {
            id: 'c1', type: 'default',
            data: { label: <div className="flex flex-col gap-1.5"><div className="flex items-center gap-1.5 font-bold text-xs"><div className="w-4 h-4 rounded flex items-center justify-center text-black bg-[#3b82f6]">D</div> Scan Dataset</div><div className="text-[9px] text-gray-400 bg-black/30 p-1 rounded">Carga: "clientes.csv"</div></div> },
            position: { x: 50, y: 10 }, style: blueBorder
        },
        {
            id: 'c2', type: 'default',
            data: { label: <div className="flex flex-col gap-1.5"><div className="flex items-center gap-1.5 font-bold text-xs"><div className="w-4 h-4 rounded flex items-center justify-center text-black bg-[#06b6d4]">M</div> KMeans</div><div className="text-[9px] text-gray-400 bg-black/30 p-1 rounded">Features: ["edad", "ingresos"]<br/>Clusters: 3<br/><span className="text-cyan-400 font-semibold">+ Agrega: "cluster"</span></div></div> },
            position: { x: 50, y: 110 }, style: cyanBorder
        },
        {
            id: 'c3', type: 'default',
            data: { label: <div className="flex flex-col gap-1.5"><div className="flex items-center gap-1.5 font-bold text-xs"><div className="w-4 h-4 rounded flex items-center justify-center text-white bg-[#9333ea]">V</div> Scatter Plot</div><div className="text-[9px] text-gray-400 bg-black/30 p-1 rounded">X: "edad"<br/>Y: "ingresos"<br/>Color: "cluster"</div></div> },
            position: { x: 50, y: 230 }, style: purpleBorder
        }
    ];

    const clusteringEdges: Edge[] = [
        { id: 'e-c1', source: 'c1', target: 'c2', animated: true, style: { stroke: '#0891b2', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#0891b2' } },
        { id: 'e-c2', source: 'c2', target: 'c3', animated: true, style: { stroke: '#7e22ce', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#7e22ce' } }
    ];

    // --- Classification Nodes & Edges ---
    const classificationNodes: Node[] = [
        {
            id: 'cl1', type: 'default',
            data: { label: <div className="flex flex-col gap-1.5"><div className="flex items-center gap-1.5 font-bold text-xs"><div className="w-4 h-4 rounded flex items-center justify-center text-black bg-[#3b82f6]">D</div> Scan Dataset</div><div className="text-[9px] text-gray-400 bg-black/30 p-1 rounded">Carga: "fraudes.csv"</div></div> },
            position: { x: 50, y: 10 }, style: blueBorder
        },
        {
            id: 'cl2', type: 'default',
            data: { label: <div className="flex flex-col gap-1.5"><div className="flex items-center gap-1.5 font-bold text-xs"><div className="w-4 h-4 rounded flex items-center justify-center text-black bg-[#06b6d4]">M</div> Logistic Regression</div><div className="text-[9px] text-gray-400 bg-black/30 p-1 rounded">Features: ["monto", "hora"]<br/>Target: "es_fraude"<br/><span className="text-cyan-400 font-semibold">+ Agrega: "prediction"</span></div></div> },
            position: { x: 50, y: 110 }, style: cyanBorder
        },
        {
            id: 'cl3', type: 'default',
            data: { label: <div className="flex flex-col gap-1.5"><div className="flex items-center gap-1.5 font-bold text-xs"><div className="w-4 h-4 rounded flex items-center justify-center text-white bg-[#9333ea]">V</div> Confusion Matrix</div><div className="text-[9px] text-gray-400 bg-black/30 p-1 rounded">True: "es_fraude"<br/>Predicted: "prediction"</div></div> },
            position: { x: 50, y: 240 }, style: purpleBorder
        }
    ];

    const classificationEdges: Edge[] = [
        { id: 'e-cl1', source: 'cl1', target: 'cl2', animated: true, style: { stroke: '#0891b2', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#0891b2' } },
        { id: 'e-cl2', source: 'cl2', target: 'cl3', animated: true, style: { stroke: '#7e22ce', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#7e22ce' } }
    ];

    // --- Dimensionality Reduction Nodes & Edges ---
    const reductionNodes: Node[] = [
        {
            id: 'r1', type: 'default',
            data: { label: <div className="flex flex-col gap-1.5"><div className="flex items-center gap-1.5 font-bold text-xs"><div className="w-4 h-4 rounded flex items-center justify-center text-black bg-[#3b82f6]">D</div> Scan Dataset</div><div className="text-[9px] text-gray-400 bg-black/30 p-1 rounded">Carga: "genes.csv"</div></div> },
            position: { x: 50, y: 10 }, style: blueBorder
        },
        {
            id: 'r2', type: 'default',
            data: { label: <div className="flex flex-col gap-1.5"><div className="flex items-center gap-1.5 font-bold text-xs"><div className="w-4 h-4 rounded flex items-center justify-center text-black bg-[#06b6d4]">M</div> Truncated SVD (PCA)</div><div className="text-[9px] text-gray-400 bg-black/30 p-1 rounded">Features: ["g1", "g2", ..., "g100"]<br/>Components: 2<br/><span className="text-cyan-400 font-semibold">+ Agrega: "pca_0", "pca_1"</span></div></div> },
            position: { x: 50, y: 110 }, style: cyanBorder
        },
        {
            id: 'r3', type: 'default',
            data: { label: <div className="flex flex-col gap-1.5"><div className="flex items-center gap-1.5 font-bold text-xs"><div className="w-4 h-4 rounded flex items-center justify-center text-white bg-[#9333ea]">V</div> Scatter Plot</div><div className="text-[9px] text-gray-400 bg-black/30 p-1 rounded">X: "pca_0"<br/>Y: "pca_1"</div></div> },
            position: { x: 50, y: 240 }, style: purpleBorder
        }
    ];

    const reductionEdges: Edge[] = [
        { id: 'e-r1', source: 'r1', target: 'r2', animated: true, style: { stroke: '#0891b2', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#0891b2' } },
        { id: 'e-r2', source: 'r2', target: 'r3', animated: true, style: { stroke: '#7e22ce', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#7e22ce' } }
    ];

    const getCurrentFlow = () => {
        switch (activeTab) {
            case "clustering": return { nodes: clusteringNodes, edges: clusteringEdges, desc: "Agrupa datos similares. El modelo añade una columna 'cluster' que puedes usar como Color en un gráfico de dispersión." };
            case "classification": return { nodes: classificationNodes, edges: classificationEdges, desc: "Predice etiquetas (Target). El modelo añade una columna 'prediction' que puedes comparar con el valor real usando la Matriz de Confusión." };
            case "reduction": return { nodes: reductionNodes, edges: reductionEdges, desc: "Reduce cientos de columnas a solo 2 o 3 componentes (ej. pca_0, pca_1) para poder graficarlas fácilmente en un Scatter Plot 2D." };
        }
    };

    const currentFlow = getCurrentFlow();

    return (
        <div className="flex flex-col gap-3 p-4 mb-2 rounded-2xl border border-cyan-500/30 bg-cyan-950/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40">
                        <Info className="w-4 h-4 text-cyan-300" />
                    </div>
                    <h4 className="text-sm font-bold text-cyan-200">Guía Práctica: Scikit-Learn</h4>
                </div>
                <div className="flex bg-slate-950/60 rounded-lg p-1 border border-white/5">
                    <button onClick={() => setActiveTab("clustering")} className={`px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition-all ${activeTab === 'clustering' ? 'bg-cyan-500/20 text-cyan-200' : 'text-gray-400 hover:text-white'}`}><Network className="w-3 h-3"/> Clustering</button>
                    <button onClick={() => setActiveTab("classification")} className={`px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition-all ${activeTab === 'classification' ? 'bg-cyan-500/20 text-cyan-200' : 'text-gray-400 hover:text-white'}`}><BrainCircuit className="w-3 h-3"/> Clasificación</button>
                    <button onClick={() => setActiveTab("reduction")} className={`px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition-all ${activeTab === 'reduction' ? 'bg-cyan-500/20 text-cyan-200' : 'text-gray-400 hover:text-white'}`}><BarChart2 className="w-3 h-3"/> Reducción</button>
                </div>
            </div>
            
            <p className="text-xs text-cyan-100/80 leading-relaxed min-h-[32px]">
                {currentFlow.desc}
            </p>

            <div className="h-80 w-full rounded-xl border border-cyan-500/20 bg-slate-950/50 overflow-hidden relative">
                <ReactFlow
                    key={activeTab} // Force re-render on tab change
                    nodes={currentFlow.nodes}
                    edges={currentFlow.edges}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    proOptions={{ hideAttribution: true }}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    zoomOnScroll={false}
                    panOnDrag={false}
                >
                    <Background color="#06b6d433" gap={16} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
};
