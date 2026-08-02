"use client";

import React, { useState } from "react";
import { Modal } from "@heroui/react";
import { Button } from "../../shared/atoms/Button";
import { HelpCircle, ArrowRight, Plus, Info, Link2, Network, SplitSquareHorizontal, Boxes } from "lucide-react";
import { CATEGORIES } from "./data/node-categories";
import { ICON_MAP } from "./data/node-icons";
import { getNodeMetadata } from "../../shared/utils/node_metadata";
import { NODE_TYPE_COLORS } from "../../shared/types/ast_types";
import { MLFlowExample } from "../molecules/MLFlowExample";

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddNode: (nodeType: string, method?: string) => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
    isOpen,
    onClose,
    onAddNode
}) => {
    const [activeCategory, setActiveCategory] = useState<string>("columns");

    const category = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
    const CategoryIcon = activeCategory === "dag_help" ? Network : (category ? (category.id === "dates" ? ICON_MAP.call : category.icon) : HelpCircle);

    const handleNodeClick = (type: string, method?: string) => {
        onAddNode(type, method);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Modal.Backdrop className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-sm" />
            <Modal.Container className="z-[2001] fixed inset-0 !flex !items-center !justify-center p-4">
                <Modal.Dialog className="relative mx-auto my-auto flex h-[80vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[28px] border border-fuchsia-300/20 bg-[radial-gradient(circle_at_top_left,_rgba(217,70,239,0.14),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.12),_transparent_24%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(17,24,39,0.96))] text-white shadow-[0_0_42px_rgba(168,85,247,0.18)] focus:outline-none">
                    <Modal.CloseTrigger className="absolute right-4 top-4 cursor-pointer rounded-xl border border-white/10 bg-white/5 p-1.5 text-fuchsia-100/55 transition-colors hover:bg-white/10 hover:text-fuchsia-50 focus:outline-none" />
                    
                    <Modal.Header className="flex items-center gap-2.5 border-b border-fuchsia-300/12 p-5 shrink-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-fuchsia-300/30 bg-gradient-to-br from-fuchsia-500/20 to-cyan-400/20">
                            <HelpCircle className="w-5 h-5 text-cyan-100" />
                        </div>
                        <div>
                            <Modal.Heading className="text-lg font-bold text-white leading-tight">
                                Manual de Referencia de Nodos
                            </Modal.Heading>
                            <p className="mt-0.5 text-xs text-fuchsia-100/55">
                                Aprende a conectar nodos en tu flujo Polars AST y agrégalos con un solo click.
                            </p>
                        </div>
                    </Modal.Header>

                    <Modal.Body className="flex flex-1 flex-row overflow-hidden bg-white/[0.03] p-0">
                        {/* Left Sidebar - Categories */}
                        <div className="custom-scrollbar flex w-56 shrink-0 select-none flex-col gap-1.5 overflow-y-auto border-r border-fuchsia-300/12 bg-white/[0.04] p-4">
                            <span className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-100/40">
                                Guías Avanzadas
                            </span>
                            <button
                                onClick={() => setActiveCategory("dag_help")}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all duration-200 cursor-pointer mb-4 ${
                                    activeCategory === "dag_help"
                                        ? "border border-fuchsia-300/30 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-fuchsia-50 shadow-[0_0_18px_rgba(168,85,247,0.08)]"
                                        : "border border-transparent text-fuchsia-100/55 hover:bg-white/5 hover:text-fuchsia-50"
                                }`}
                            >
                                <Network className={`w-4 h-4 shrink-0 ${activeCategory === "dag_help" ? "text-cyan-200" : "text-fuchsia-100/40"}`} />
                                <span className="truncate">Grafos Complejos</span>
                            </button>

                            <span className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-100/40">
                                Categorías
                            </span>
                            {CATEGORIES.map((cat) => {
                                const CatIcon = cat.id === "dates" ? ICON_MAP.call : cat.icon;
                                const isActive = cat.id === activeCategory;

                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                            isActive
                                                ? "border border-fuchsia-300/30 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-fuchsia-50 shadow-[0_0_18px_rgba(168,85,247,0.08)]"
                                                : "border border-transparent text-fuchsia-100/55 hover:bg-white/5 hover:text-fuchsia-50"
                                        }`}
                                    >
                                        <CatIcon className={`w-4 h-4 shrink-0 ${isActive ? "text-cyan-200" : "text-fuchsia-100/40"}`} />
                                        <span className="truncate">{cat.name}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right Panel - Node List */}
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                            <div className="flex items-center gap-2 border-b border-white/8 pb-3">
                                <CategoryIcon className="w-5 h-5 text-cyan-200/85" />
                                <h3 className="text-sm font-bold text-fuchsia-50">
                                    {activeCategory === "dag_help" ? "Creación de Grafos Complejos (DAG)" : category?.name}
                                </h3>
                                {activeCategory !== "dag_help" && (
                                    <span className="rounded-full border border-fuchsia-300/18 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-fuchsia-100/55">
                                        {category?.items.length} nodos
                                    </span>
                                )}
                            </div>

                            {activeCategory === "dag_help" ? (
                                <div className="flex flex-col gap-6 text-fuchsia-50">
                                    <div className="group rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-500/20 border border-cyan-500/40">
                                                <SplitSquareHorizontal className="w-4 h-4 text-cyan-200" />
                                            </div>
                                            <h4 className="text-sm font-bold text-cyan-50">Múltiples Salidas (Bifurcaciones)</h4>
                                        </div>
                                        <p className="text-xs leading-relaxed text-fuchsia-100/80 mb-4">
                                            Ahora Denki soporta <strong>Directed Acyclic Graphs (DAG)</strong>. Esto significa que puedes procesar tus datos una sola vez y bifurcar el resultado hacia múltiples destinos simultáneamente sin duplicar el trabajo.
                                        </p>
                                        <pre className="text-[10px] font-mono text-zinc-300 bg-zinc-950/80 p-3 rounded border border-white/5 whitespace-pre overflow-x-auto">
{`          ┌────────────────────────┐
          │  Limpieza de Datos     │
          └───────┬────────┬───────┘
                  │        │
           ┌──────▼─┐    ┌─▼──────┐
           │ A CSV  │    │ A HTML │
           └────────┘    └────────┘`}
                                        </pre>
                                        <div className="mt-4 flex flex-col gap-2 text-xs text-fuchsia-100/60">
                                            <p><strong className="text-cyan-200">¿Cómo hacerlo?</strong> Simplemente arrastra múltiples flechas desde el puerto de salida de un nodo hacia diferentes nodos destino (ej. un `write_csv` y un `write_html`). Al exportar, el motor generará ambas ramas de forma optimizada.</p>
                                        </div>
                                    </div>

                                    <div className="group rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-fuchsia-500/20 border border-fuchsia-500/40">
                                                <Boxes className="w-4 h-4 text-fuchsia-200" />
                                            </div>
                                            <h4 className="text-sm font-bold text-fuchsia-50">Subgrafos (Macro Nodos)</h4>
                                        </div>
                                        <p className="text-xs leading-relaxed text-fuchsia-100/80 mb-4">
                                            Los subgrafos te permiten agrupar múltiples operaciones complejas en un solo bloque lógico (macro nodo). Esto limpia visualmente el lienzo y permite reutilizar lógicas enteras.
                                        </p>
                                            <p><strong className="text-fuchsia-200">¿Para qué sirven los Subgrafos?</strong></p>
                                            <ul className="list-disc list-inside text-fuchsia-100/70 space-y-1.5 ml-1">
                                                <li><strong>Organización Visual:</strong> Cuando tu pipeline crece (ej. 20+ nodos), el lienzo puede volverse caótico. Agrupar la lógica de "Limpieza de Datos" en un solo bloque mantiene todo limpio.</li>
                                                <li><strong>Reutilización Lógica:</strong> Empaqueta operaciones repetitivas (como Estandarizar + Filtrar + Convertir a Float) en una sola caja que representa un "Paso" de tu ETL.</li>
                                                <li><strong>Eficiencia del Motor:</strong> Al exportar, el motor JSON trata toda la caja como una entidad aislada con puertos definidos, lo que es óptimo para ejecuciones modulares en el backend.</li>
                                            </ul>
                                            
                                            <div className="bg-white/5 border border-white/10 p-3 rounded-lg mt-3">
                                                <strong className="text-fuchsia-200 text-[11px] uppercase tracking-wider block mb-2">Instrucciones de Uso Visual</strong>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-start gap-2">
                                                        <span className="shrink-0 bg-fuchsia-500/20 text-fuchsia-300 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">1</span>
                                                        <p><strong>Selección:</strong> Mantén pulsada la tecla <kbd className="font-mono bg-white/10 px-1 py-0.5 rounded text-[10px] mx-1 border border-white/10">Shift</kbd> y arrastra el ratón para crear un cuadro de selección sobre los nodos que quieres empaquetar.</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <span className="shrink-0 bg-fuchsia-500/20 text-fuchsia-300 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">2</span>
                                                        <p><strong>Agrupación:</strong> Haz clic en el botón <strong className="text-white">Agrupar</strong> (ícono de recuadro) en la barra superior. Verás aparecer una caja de "Cristal" que encierra tus nodos.</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <span className="shrink-0 bg-fuchsia-500/20 text-fuchsia-300 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">3</span>
                                                        <p><strong>Conexión Externa:</strong> Puedes trazar líneas desde nodos de afuera hacia nodos dentro de la caja sin problema. El motor detectará automáticamente estos cables como <em>"Puertos Virtuales"</em> de entrada (bindings).</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <span className="shrink-0 bg-fuchsia-500/20 text-fuchsia-300 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">4</span>
                                                        <p><strong>Desagrupar:</strong> Si necesitas liberar los nodos, selecciona la caja (Macro Nodo) y pulsa el botón <strong className="text-white">Desagrupar</strong> en el menú superior.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="mt-2 p-3 bg-fuchsia-950/30 border border-fuchsia-500/20 rounded-lg text-fuchsia-200/80">
                                                <Info className="inline w-3 h-3 mr-1" />
                                                <em><strong>Importante:</strong> Para mantener la integridad arquitectónica, una vez que los nodos están dentro de un Macro Nodo, quedan "atrapados" visualmente dentro de sus límites. No puedes arrastrarlos por fuera de la caja contenedora.</em>
                                            </p>
                                        </div>
                                    </div>
                            ) : (
                                <>
                                    {category?.id === "machine_learning" && <MLFlowExample />}
                                    <div className="flex flex-col gap-6">
                                {category?.items.map((item, idx) => {
                                    const meta = getNodeMetadata(item.type, item.method ? { method: item.method } : {});
                                    const colorToken = NODE_TYPE_COLORS[item.type] || { bg: "#6b7280" };
                                    const ItemIcon = ICON_MAP[item.type] || ICON_MAP.call;

                                    return (
                                        <div
                                            key={idx}
                                            className="group rounded-2xl border border-white/8 bg-white/[0.04] p-4 transition-all duration-200 hover:border-fuchsia-300/22 hover:bg-white/[0.06]"
                                        >
                                            {/* Header */}
                                            <div className="flex items-center gap-3 mb-2.5">
                                                <div
                                                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                                                    style={{
                                                        backgroundColor: `${colorToken.bg}20`,
                                                        border: `1.5px solid ${colorToken.bg}40`
                                                    }}
                                                >
                                                    <ItemIcon className="w-4 h-4" style={{ color: colorToken.bg }} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-fuchsia-50">
                                                        {meta.name}
                                                    </h4>
                                                    <p className="text-[10px] text-fuchsia-100/42">
                                                        Tipo técnico: <span className="font-mono text-fuchsia-100/65">{item.type}</span>
                                                        {item.method && <> • Método: <span className="font-mono text-fuchsia-100/65">.{item.method}()</span></>}
                                                    </p>
                                                </div>
                                                <div className="ml-auto">
                                                    <Button
                                                        size="sm"
                                                        className="h-7 rounded-xl border border-fuchsia-300/25 bg-white/5 px-2.5 text-[10px] font-semibold text-fuchsia-50 transition-all hover:border-cyan-300/35 hover:bg-cyan-500/12"
                                                        onPress={() => handleNodeClick(item.type, item.method)}
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" />
                                                        Agregar
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="mb-2 text-xs leading-relaxed text-fuchsia-100/78">
                                                {meta.description}
                                            </p>

                                            {/* Typical use */}
                                            <div className="mb-3.5 flex items-start gap-1 rounded-xl border border-white/8 bg-slate-950/55 p-2.5 text-xs leading-relaxed text-fuchsia-100/58">
                                                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-200/70" />
                                                <span>
                                                    <strong className="text-cyan-100">Caso de uso típico:</strong> {meta.typicalUse}
                                                </span>
                                            </div>

                                            {/* Pipeline Diagram */}
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-fuchsia-100/42">
                                                    Ejemplo de Flujo Típico (Click en cualquier nodo para agregarlo)
                                                </span>
                                                <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/8 bg-slate-950/75 p-2.5 shadow-inner">
                                                    {meta.pipeline.map((step: any, stepIdx: number) => (
                                                        <React.Fragment key={stepIdx}>
                                                            {stepIdx > 0 && (
                                                                <ArrowRight className="w-3 h-3 shrink-0 text-fuchsia-100/28" />
                                                            )}
                                                            <button
                                                                onClick={() => handleNodeClick(step.type, step.method)}
                                                                className="group/btn flex cursor-pointer items-center gap-1 rounded-lg border border-fuchsia-300/16 bg-white/6 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-50 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.2)] hover:border-cyan-300/30 hover:bg-cyan-500/12 hover:text-cyan-100 active:scale-95"
                                                                title={`Agregar '${step.label}' al lienzo`}
                                                            >
                                                                <span>{step.label}</span>
                                                                <Plus className="w-2.5 h-2.5 shrink-0 text-fuchsia-100/40 group-hover/btn:text-cyan-200" />
                                                            </button>
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                                <p className="pl-1 text-[10px] italic leading-relaxed text-fuchsia-100/50">
                                                    {meta.pipelineExplanation}
                                                </p>
                                            </div>

                                            {/* Chain-specific connection guide.
                                                The Chain node is the only one that
                                                accepts N operands, so it gets a
                                                dedicated visual + JSON walkthrough. */}
                                            {item.type === "chain" && (
                                                <div className="flex flex-col gap-2 p-3 mt-1 rounded-lg border border-fuchsia-500/20 bg-fuchsia-950/20">
                                                    <span className="text-[9px] font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Link2 className="w-3 h-3" />
                                                        Cómo conectar el Chain
                                                    </span>

                                                    {/* ASCII visual of N operands converging */}
                                                    <pre className="text-[10px] font-mono text-zinc-300 bg-zinc-950/80 p-2.5 rounded border border-white/5 whitespace-pre overflow-x-auto">
{`              operand 1  operand 2  operand 3  operand N
                  (Col)     (Col)      (Lit)      (Col)
                    │         │          │          │
                    └─────────┴─────┬────┴──────────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │  Chain (OR)   │  ← operador: |  o  &
                            └───────┬───────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │    Filter     │
                            └───────────────┘`}
                                                    </pre>

                                                    <div className="flex flex-col gap-1.5 text-[10px] text-zinc-300">
                                                        <div>
                                                            <strong className="text-fuchsia-200">1.</strong>{" "}
                                                            Arrastra un <code className="font-mono text-fuchsia-300">Chain</code> desde la categoría
                                                            <em> Operaciones</em>.
                                                        </div>
                                                        <div>
                                                            <strong className="text-fuchsia-200">2.</strong>{" "}
                                                            Elige el operador en el panel: <code className="font-mono text-fuchsia-300">| (OR)</code>{" "}
                                                            o <code className="font-mono text-fuchsia-300">& (AND)</code>.
                                                        </div>
                                                        <div>
                                                            <strong className="text-fuchsia-200">3.</strong>{" "}
                                                            Conecta <strong>2 o más</strong> operandos al Chain desde el canvas
                                                            (edges que <em>entran</em> al Chain).
                                                        </div>
                                                        <div>
                                                            <strong className="text-fuchsia-200">4.</strong>{" "}
                                                            Conecta la salida del Chain al{" "}
                                                            <code className="font-mono text-fuchsia-300">predicate</code>{" "}
                                                            de un <code className="font-mono text-fuchsia-300">filter</code> (o úsalo dentro de
                                                            un <code className="font-mono text-fuchsia-300">with_columns</code>).
                                                        </div>
                                                    </div>

                                                    {/* JSON the wrapper generates */}
                                                    <div className="flex flex-col gap-1 mt-1">
                                                        <span className="text-[9px] font-bold text-fuchsia-300 uppercase tracking-wider">
                                                            JSON que el wrapper genera
                                                        </span>
                                                        <pre className="text-[10px] font-mono text-zinc-300 bg-zinc-950/80 p-2.5 rounded border border-white/5 overflow-x-auto">
{`// Entrada: chain con op="|", operandos=[a, b, c]
// Salida (AST válido, sin tocar el parser):
{
  "type": "binary", "op": "|",
  "left":  { "type": "binary", "op": "|",
            "left":  a, "right": b },
  "right": c
}
// Equivale a: (a | b) | c    (left-associative)`}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Guía de conexión para combine_conditions */}
                                            {item.type === "combine_conditions" && (
                                                <div className="flex flex-col gap-2 p-3 mt-1 rounded-lg border border-violet-500/20 bg-violet-950/20">
                                                    <span className="text-[9px] font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Link2 className="w-3 h-3" />
                                                        Cómo combinar condiciones booleanas
                                                    </span>

                                                    {/* Caso simple: un operador */}
                                                    <p className="text-[10px] text-zinc-300">
                                                        <strong className="text-violet-200">Caso simple</strong> — todas las condiciones con el mismo operador:
                                                    </p>
                                                    <pre className="text-[10px] font-mono text-zinc-300 bg-zinc-950/80 p-2.5 rounded border border-white/5 whitespace-pre overflow-x-auto">
{`   [is_in]   [contains_any]   [is_between]
       │             │               │
       └─────────────┴───────────────┘
                     │  (puerto "conds")
                     ▼
          ┌──────────────────────┐
          │  combine_conditions  │  ← operator: AND
          └──────────┬───────────┘
                     │
                     ▼
           [series_filter  pred]`}
                                                    </pre>

                                                    {/* Caso complejo: árbol de operadores */}
                                                    <p className="text-[10px] text-zinc-300 mt-1">
                                                        <strong className="text-violet-200">Caso complejo</strong> — operadores mixtos → anida nodos:
                                                    </p>
                                                    <pre className="text-[10px] font-mono text-zinc-300 bg-zinc-950/80 p-2.5 rounded border border-white/5 whitespace-pre overflow-x-auto">
{`   [A]    [B]              [C]
    │       │                │
    └───────┘                │
         │                   │
         ▼                   │
  ┌─────────────┐            │
  │ comb. AND   │            │
  └──────┬──────┘            │
         │                   │
         └───────────────────┘
                   │  (puerto "conds")
                   ▼
        ┌─────────────────────┐
        │    comb. OR         │  ← resultado: (A AND B) OR C
        └──────────┬──────────┘
                   ▼
         [series_filter  pred]`}
                                                    </pre>

                                                    <div className="flex flex-col gap-1.5 text-[10px] text-zinc-300 mt-1">
                                                        <div>
                                                            <strong className="text-violet-200">Regla clave:</strong>{" "}
                                                            un nodo = un operador para <em>todas</em> sus entradas. Para mezclar AND + OR, encadena dos nodos.
                                                        </div>
                                                        <div>
                                                            <strong className="text-violet-200">NOT:</strong>{" "}
                                                            solo usa <strong>la primera</strong> condición conectada — conecta únicamente una.
                                                        </div>
                                                        <div>
                                                            <strong className="text-violet-200">Sin límite:</strong>{" "}
                                                            puedes conectar tantas series booleanas como necesites al puerto <code className="font-mono text-violet-300">conds</code>.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Guía de conexión para nodos Exportadores */}
                                            {["write_csv", "write_excel", "write_html"].includes(item.type) && (
                                                <div className="flex flex-col gap-2 p-3 mt-1 rounded-lg border border-emerald-500/20 bg-emerald-950/20">
                                                    <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Info className="w-3 h-3" />
                                                        Cómo conectar los Exportadores
                                                    </span>

                                                    <pre className="text-[10px] font-mono text-zinc-300 bg-zinc-950/80 p-2.5 rounded border border-white/5 whitespace-pre overflow-x-auto">
{`           OPCIÓN A: Directo                 OPCIÓN B: Tras operaciones
      ┌────────────────────────┐          ┌────────────────────────┐
      │  Scan Dataset (Carga)  │          │  Scan Dataset (Carga)  │
      └───────────┬────────────┘          └───────────┬────────────┘
                  │                                   │
                  ▼                                   ▼
      ┌────────────────────────┐          ┌────────────────────────┐
      │     WRITE CSV/EXCEL    │          │ Select / Filter / etc. │
      └────────────────────────┘          └───────────┬────────────┘
                                                      │
                                                      ▼
                                          ┌────────────────────────┐
                                          │     WRITE CSV/EXCEL    │
                                          └────────────────────────┘`}
                                                    </pre>

                                                    <div className="flex flex-col gap-1.5 text-[10px] text-zinc-300">
                                                        <div>
                                                            <strong className="text-emerald-200">1.</strong>{" "}
                                                            El exportador es un nodo de <strong className="text-emerald-300">Flujo Principal de Datos (DataFrame)</strong>.
                                                        </div>
                                                        <div>
                                                            <strong className="text-emerald-200">2.</strong>{" "}
                                                            <strong>NUNCA</strong> lo conectes debajo de un nodo de columna individual (ej. <code className="font-mono text-emerald-300">Col</code> o <code className="font-mono text-emerald-300">Str.Contains</code>).
                                                        </div>
                                                        <div>
                                                            <strong className="text-emerald-200">3.</strong>{" "}
                                                            Puedes conectarlo directamente debajo del <code className="font-mono text-emerald-300">Scan Dataset</code> (Opción A) o al final de cualquier flujo que procese tablas completas (Opción B).
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                </div>
                                </>
                            )}
                        </div>
                    </Modal.Body>

                    <Modal.Footer className="flex justify-end border-t border-fuchsia-300/12 bg-white/[0.03] p-4 shrink-0">
                        <Button
                            className="border border-white/10 bg-white/5 text-blue-100/80 hover:bg-white/10 h-9 px-4 rounded-lg"
                            onPress={onClose}
                        >
                            Cerrar
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal>
    );
};
