"use client";

import React, { useState } from "react";
import { Modal } from "@heroui/react";
import { Button } from "../../shared/atoms/Button";
import { Library, BookOpen, Sparkles, AlertTriangle, Plus, X } from "lucide-react";

import { PIPELINE_EXAMPLES } from "../examples";

interface ExamplesLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    /**
     * Called when the user picks an example to load.  ``replace``
     * indicates the canvas should be cleared first; ``append``
     * adds the example's nodes/edges to the current canvas.
     */
    onLoad: (
        exampleId: string,
        mode: "replace" | "append",
    ) => void;
}

/**
 * Human-friendly metadata for the library.  Lives here (not in the
 * example modules) so adding a new example is a single-file change
 * and the description is not coupled to the implementation file.
 */
type ExampleMeta = {
    title: string;
    tagline: string;
    description: string;
    emoji: string;
    color: string;
    operator?: "OR" | "AND";
    operandCount?: number;
};

const EXAMPLE_DESCRIPTIONS: Record<string, ExampleMeta> = {
    "chain-product": {
        title: "Chain OR (3 operandos)",
        tagline: "Ejemplo introductorio del wrapper Chain.",
        description:
            "Demuestra el operador OR con 3 operandos: dos columnas (product, revenue) y un literal. El Chain se serializa como un árbol left-associative de BinaryOps ((a|b)|c) y se usa como predicate de un filter.",
        operator: "OR",
        operandCount: 3,
        emoji: "🛒",
        color: "from-fuchsia-400 to-pink-500",
    },
    "chain-nationalities": {
        title: "Chain AND (4 expresiones)",
        tagline: "Demuestra AND con un caso realista.",
        description:
            "Demuestra el operador AND con 4 expresiones: la columna nacionalidad igualada contra 4 literales (ES, MX, AR, CO). Cada operando es un BinaryOp(==) completo. El Chain se traduce a (((a & b) & c) & d).",
        operator: "AND",
        operandCount: 4,
        emoji: "🌎",
        color: "from-cyan-400 to-blue-500",
    },
    // ─── Series AST examples ─────────────────────────────────────────
    "series-numeric-cleaning": {
        title: "Limpieza Numérica",
        tagline: "fill_null → abs → round(2).",
        description:
            "Cadena de Series para limpiar datos numéricos: rellena nulos con 0, toma valores absolutos y redondea a 2 decimales. Demuestra 4 pasos encadenados con el puente get_column.",
        emoji: "🧹",
        color: "from-purple-400 to-violet-500",
    },
    "series-string-normalization": {
        title: "Normalización de Texto",
        tagline: "str_strip → str_to_lowercase → str_lengths.",
        description:
            "Normaliza cadenas de texto: elimina espacios extremos, convierte a minúsculas y calcula la longitud de cada cadena. Ideal para limpieza de datos textuales.",
        emoji: "📝",
        color: "from-amber-400 to-orange-500",
    },
    "series-datetime-extraction": {
        title: "Extracción de Año",
        tagline: "dt_year sobre columna de fecha.",
        description:
            "Extrae el componente año de una columna datetime. Demuestra una cadena simple con el nodo dt_year conectado a un get_column.",
        emoji: "📅",
        color: "from-cyan-400 to-teal-500",
    },
    "series-cumulative-sum": {
        title: "Suma Acumulativa",
        tagline: "cum_sum desde get_column.",
        description:
            "Calcula la suma acumulativa de valores numéricos. Útil para totales corrientes o series temporales.",
        emoji: "📈",
        color: "from-blue-400 to-indigo-500",
    },
    "series-rolling-mean": {
        title: "Media Móvil",
        tagline: "rolling_mean con ventana de 3.",
        description:
            "Calcula la media móvil de 3 períodos sobre una columna numérica. Ideal para suavizar series temporales.",
        emoji: "📊",
        color: "from-green-400 to-emerald-500",
    },
    "series-array-lengths": {
        title: "Longitud de Listas",
        tagline: "arr_lengths sobre columna de listas.",
        description:
            "Calcula la longitud de cada lista interna en una columna de tipo List. Ejemplo de operaciones sobre listas anidadas.",
        emoji: "📋",
        color: "from-pink-400 to-rose-500",
    },
    "series-mean": {
        title: "Promedio Simple",
        tagline: "mean — agregación básica.",
        description:
            "Calcula la media aritmética de una columna numérica. Ejemplo mínimo de agregación sobre una cadena de Series.",
        emoji: "🎯",
        color: "from-red-400 to-orange-500",
    },
    "series-shift-diff": {
        title: "Shift + Diff",
        tagline: "shift(1) → diff(1) para cambios periódicos.",
        description:
            "Desplaza valores 1 período y luego calcula diferencias. Demuestra el patrón clásico de análisis de cambios período a período.",
        emoji: "🔄",
        color: "from-sky-400 to-blue-500",
    },
    // ─── Machine Learning AST examples ───────────────────────────────
    "ml-clustering": {
        title: "Clustering (K-Means)",
        tagline: "Agrupación automática de datos.",
        description:
            "Pipeline de Machine Learning completo: Carga datos, ejecuta el modelo KMeans para agrupar en 3 clusters según la edad y los ingresos, y visualiza el resultado coloreando por el cluster asignado.",
        emoji: "🧠",
        color: "from-cyan-400 to-teal-500",
    },
    "ml-classification": {
        title: "Clasificación (Regresión Logística)",
        tagline: "Predicción de fraudes.",
        description:
            "Modelo de clasificación: Predice una etiqueta (fraude) basándose en características (monto y hora). Finaliza con una Matriz de Confusión para comparar las predicciones con los valores reales.",
        emoji: "🤖",
        color: "from-fuchsia-400 to-purple-500",
    },
    "dag_subgraph": {
        title: "Subgrafos y DAG",
        tagline: "Macro Nodos y Múltiples Salidas.",
        description:
            "Demuestra la arquitectura avanzada de Denki: Un 'Macro Nodo' que encapsula múltiples operaciones (Filtro y Formato) de forma visual. La salida se bifurca hacia dos destinos distintos simultáneamente, demostrando las capacidades de Grafo Dirigido Acíclico (DAG). Todo se hace en memoria sin rutas de archivos.",
        emoji: "📦",
        color: "from-pink-500 to-rose-600",
    },
};

export const ExamplesLibrary = ({ isOpen, onClose, onLoad }: ExamplesLibraryProps) => {
    const [pendingMode, setPendingMode] = useState<"replace" | "append" | null>(
        null,
    );
    const [pendingExampleId, setPendingExampleId] = useState<string | null>(null);

    const handlePick = (exampleId: string) => {
        setPendingExampleId(exampleId);
    };

    const confirmLoad = (mode: "replace" | "append") => {
        if (pendingExampleId) {
            onLoad(pendingExampleId, mode);
            setPendingExampleId(null);
            setPendingMode(null);
            onClose();
        }
    };

    const cancel = () => {
        setPendingExampleId(null);
        setPendingMode(null);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Modal.Backdrop className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-sm" />
            <Modal.Container className="z-[2001] fixed inset-0 !flex !items-center !justify-center p-4">
                <Modal.Dialog className="relative mx-auto my-auto flex max-h-[85vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[28px] border border-fuchsia-300/20 bg-[radial-gradient(circle_at_top_left,_rgba(217,70,239,0.14),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.12),_transparent_22%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(17,24,39,0.96))] text-white shadow-[0_0_42px_rgba(168,85,247,0.18)] focus:outline-none">
                    <Modal.CloseTrigger className="absolute right-4 top-4 cursor-pointer rounded-xl border border-white/10 bg-white/5 p-1.5 text-fuchsia-100/55 transition-colors hover:bg-white/10 hover:text-fuchsia-50 focus:outline-none" />

                    <Modal.Header className="border-b border-white/10 p-5 shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center shrink-0">
                                <Library className="w-5 h-5 text-fuchsia-400" />
                            </div>
                            <div>
                                <Modal.Heading className="text-lg font-bold text-white flex items-center gap-2">
                                    Biblioteca de Ejemplos
                                </Modal.Heading>
                                <p className="mt-0.5 text-xs text-fuchsia-100/55">
                                    Pipelines listos para cargar en el canvas. Útiles
                                    para entender cómo se compone cada nodo.
                                </p>
                            </div>
                        </div>
                    </Modal.Header>

                    <Modal.Body className="flex flex-1 flex-col gap-4 overflow-y-auto bg-white/[0.03] p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PIPELINE_EXAMPLES.map((example) => {
                                const meta = EXAMPLE_DESCRIPTIONS[example.id];
                                if (!meta) return null;
                                const isPending = pendingExampleId === example.id;
                                return (
                                    <div
                                        key={example.id}
                                        className={`flex flex-col gap-3 p-5 rounded-xl border transition-all cursor-pointer ${
                                            isPending
                                                ? "border-fuchsia-300/45 bg-fuchsia-500/10 ring-1 ring-fuchsia-300/35"
                                                : "border-white/8 bg-white/[0.04] hover:border-fuchsia-300/25 hover:bg-white/[0.06]"
                                        }`}
                                        onClick={() => handlePick(example.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-11 h-11 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center shrink-0 text-2xl`}
                                            >
                                                {meta.emoji}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="truncate text-sm font-bold text-fuchsia-50">
                                                    {meta.title}
                                                </h3>
                                                <p className="text-[10px] italic text-fuchsia-100/42">
                                                    {meta.tagline}
                                                </p>
                                            </div>
                                            {isPending && (
                                                <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
                                            )}
                                        </div>

                                        <p className="text-xs leading-relaxed text-fuchsia-100/70">
                                            {meta.description}
                                        </p>

                                        {meta.operator && (
                                            <div className="flex items-center gap-2 text-[10px] font-mono">
                                                <span className="rounded-full border border-fuchsia-300/25 bg-fuchsia-500/12 px-1.5 py-0.5 text-fuchsia-100">
                                                    {meta.operator}
                                                </span>
                                                {meta.operandCount !== undefined && (
                                                    <span className="text-fuchsia-100/42">
                                                        {meta.operandCount} operandos
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {pendingExampleId && (
                            <div className="flex flex-col gap-2 rounded-2xl border border-amber-300/25 bg-amber-500/8 p-4">
                                <div className="flex items-start gap-2 text-amber-200 text-xs">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>
                                        ¿Cómo quieres cargar el ejemplo?
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        className="bg-fuchsia-600/20 text-fuchsia-200 border border-fuchsia-500/50 hover:bg-fuchsia-600/40 h-10 px-4 py-2 rounded-xl"
                                        onPress={() => confirmLoad("append")}
                                    >
                                        <Plus className="w-4 h-4 mr-1.5" />
                                        Añadir al canvas
                                    </Button>
                                    <Button
                                        className="bg-red-600/20 text-[#ff0000]-200 border border-red-500/50 hover:bg-red-600/40 h-10 px-4 py-2 rounded-xl"
                                        onPress={() => confirmLoad("replace")}
                                    >
                                        <X className="w-4 h-4 mr-1.5" />
                                        Reemplazar canvas
                                    </Button>
                                </div>
                                <button
                                    onClick={cancel}
                                    className="self-center text-[10px] text-fuchsia-100/45 underline hover:text-fuchsia-100/80"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </Modal.Body>

                    <Modal.Footer className="flex justify-end border-t border-fuchsia-300/12 bg-white/[0.03] p-4 shrink-0">
                        <Button
                            className="border border-white/10 bg-white/5 text-fuchsia-100/80 hover:bg-white/10 h-9 px-4 rounded-lg"
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
