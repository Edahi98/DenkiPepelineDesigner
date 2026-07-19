import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

interface MultiSelectProps {
    label?: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
}

export const MultiSelect = ({ label, options, selected, onChange, placeholder = "Select..." }: MultiSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as HTMLElement)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggle = (opt: string) => {
        if (selected.includes(opt)) {
            onChange(selected.filter(s => s !== opt));
        } else {
            onChange([...selected, opt]);
        }
    };

    const remove = (opt: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selected.filter(s => s !== opt));
    };

    return (
        <div className="flex flex-col gap-1.5 w-full" ref={containerRef}>
            {label && (
                <label className="text-xs text-gray-200 font-semibold font-semibold uppercase tracking-wide">
                    {label}
                </label>
            )}
            <div
                onClick={() => setIsOpen(o => !o)}
                className="w-full glass-panel border border-dark hover:border-pink-500/50 focus-within:border border-emerald-500/50 rounded-lg px-3 py-2 text-sm text-white font-bold drop-shadow-sm cursor-pointer transition-colors flex flex-wrap items-center gap-1.5 min-h-[38px] relative"
            >
                {selected.length === 0 && (
                    <span className="text-gray-200 font-semibold">{placeholder}</span>
                )}
                {selected.map(s => (
                    <span
                        key={s}
                        className="inline-flex items-center gap-1 bg-gray/80 text-white font-bold drop-shadow-sm px-2 py-0.5 rounded-md text-xs font-medium"
                    >
                        {s}
                        <button
                            onClick={(e) => remove(s, e)}
                            className="hover:text-[#ff0000] transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}
                <ChevronDown
                    size={14}
                    className={`ml-auto text-gray-200 font-semibold transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </div>

            {isOpen && (
                <div className="glass-panel border border-pink-500/50 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
                    {options.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-gray-200 font-semibold italic">No options available</div>
                    ) : (
                        options.map(opt => {
                            const isSelected = selected.includes(opt);
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggle(opt);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                        isSelected
                                            ? "bg-teal/15 text-emerald-400"
                                            : "text-gray-200 font-semibold hover:glass-panel"
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                                            isSelected
                                                ? "bg-teal border-teal text-white font-bold drop-shadow-sm"
                                                : "border-pink-500/50"
                                        }`}>
                                            {isSelected && "✓"}
                                        </span>
                                        {opt}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};
