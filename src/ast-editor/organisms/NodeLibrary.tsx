import { useState } from "react";
import { ChevronDown, ChevronRight, Search, FunctionSquare } from "lucide-react";
import { NODE_TYPE_COLORS } from "../../shared/types/ast_types";
import { CATEGORIES, type NodeItem } from "./data/node-categories";
import { ICON_MAP } from "./data/node-icons";

export const NodeLibrary = () => {
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
        columns: true,
        operations: true,
        dataframe: true
    });
    const [searchQuery, setSearchQuery] = useState("");

    const toggleCategory = (id: string) => {
        setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDragStart = (event: React.DragEvent, item: NodeItem) => {
        const payload = {
            nodeType: item.type,
            isExpression: item.isExpression,
            presetProperties: {
                ...(item.presetProperties || {}),
                ...(item.method ? { method: item.method } : {})
            }
        };
        event.dataTransfer.setData("application/reactflow", JSON.stringify(payload));
        event.dataTransfer.effectAllowed = "move";
    };

    const filteredCategories = CATEGORIES.map(cat => {
        const filteredItems = cat.items.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.method && item.method.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        return { ...cat, items: filteredItems };
    }).filter(cat => cat.items.length > 0);

    return (
        <div className="w-80 flex flex-col glass-panel h-full select-none border-r-4 border-r-[var(--color-neon-purple)] z-10">
            <div className="p-4 border-b border-white/20 flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-white font-bold drop-shadow-sm">Tipos de Nodos</h3>
                <div className="relative flex items-center">
                    <Search className="absolute left-3 w-4 h-4 text-gray-200 font-semibold" />
                    <input
                        type="text"
                        placeholder="Buscar nodo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--color-dark-glass)] border-2 border-blue-500/50 focus:border-emerald-500/50 shadow-md focus:shadow-lg rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-300 focus:outline-none transition-all font-bold"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {filteredCategories.map((category) => {
                    const isOpen = searchQuery ? true : !!openCategories[category.id];
                    const CatIcon = category.id === "dates" ? ChevronRight : category.icon;

                    return (
                        <div key={category.id} className="border-2 border-pink-500/50 rounded-lg overflow-hidden glass-panel shadow-md">
                            <button
                                onClick={() => !searchQuery && toggleCategory(category.id)}
                                className="w-full px-3 py-2 flex items-center justify-between text-xs font-black text-white hover:text-emerald-400 hover:bg-white/10 transition-colors uppercase tracking-wider"
                            >
                                <div className="flex items-center gap-2">
                                    <CatIcon className="w-4 h-4 text-emerald-400/80" />
                                    <span>{category.name}</span>
                                </div>
                                {!searchQuery && (
                                    isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                                )}
                            </button>

                            {isOpen && (
                                <div className="p-2 grid grid-cols-1 gap-1.5 border-t-2 border-pink-500/50 bg-black/40 backdrop-blur-md">
                                    {category.items.map((item, idx) => {
                                        const colorToken = NODE_TYPE_COLORS[item.type] || { bg: "#6b7280" };
                                        const ItemIcon = ICON_MAP[item.type] || FunctionSquare;

                                        return (
                                            <div
                                                key={idx}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, item)}
                                                className="group p-2 rounded-lg border-2 bg-[var(--color-dark-glass)] cursor-grab active:cursor-grabbing flex items-center justify-between gap-3 transition-all duration-150 hover:shadow-lg hover:scale-105"
                                                style={{ borderColor: colorToken.bg }}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div
                                                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                                                        style={{ backgroundColor: `${colorToken.bg}20`, border: `1.5px solid ${colorToken.bg}40` }}
                                                    >
                                                        <ItemIcon className="w-4 h-4" style={{ color: colorToken.bg }} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-xs font-semibold text-white font-bold drop-shadow-sm truncate group-hover:text-white font-bold drop-shadow-sm transition-colors">
                                                            {item.label}
                                                        </h4>
                                                        <p className="text-[10px] text-gray-200 font-semibold truncate group-hover:text-gray-200 font-semibold">
                                                            {item.method ? `.${item.method}() — ` : ""}{item.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredCategories.length === 0 && (
                    <div className="text-center py-8 text-xs text-gray-200 font-semibold italic">
                        No se encontraron nodos
                    </div>
                )}
            </div>
        </div>
    );
};
