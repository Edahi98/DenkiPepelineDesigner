
import React, { useState, useEffect } from "react";
import { Select } from "../../shared/atoms/Select";
import { Switch } from "../../shared/atoms/Switch";
import { MultiSelect } from "../../shared/atoms/MultiSelect";
import { X, Plus } from "lucide-react";

interface TextFieldProps {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (val: string) => void;
}

export const TextField = ({ label, placeholder, value, onChange }: TextFieldProps) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs text-gray-200 font-semibold font-semibold uppercase tracking-wide">
                {label}
            </label>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full glass-panel border border-pink-500/50 hover:border-pink-500/50 focus:border border-emerald-500/50 rounded-lg px-3 py-2 text-sm text-white font-bold drop-shadow-sm placeholder-gray focus:outline-none transition-colors"
            />
        </div>
    );
};

interface SelectFieldProps {
    label: string;
    value: string;
    options: { value: string; label: string }[] | string[];
    onChange: (val: string) => void;
}

export const SelectField = ({ label, value, options, onChange }: SelectFieldProps) => {
    return (
        <Select
            label={label}
            value={value}
            options={options}
            onChange={(e: any) => onChange(e.target.value)}
        />
    );
};

interface SwitchFieldProps {
    label: string;
    isSelected: boolean;
    onChange: (val: boolean) => void;
}

export const SwitchField = ({ label, isSelected, onChange }: SwitchFieldProps) => {
    return (
        <Switch
            label={label}
            isSelected={isSelected}
            onValueChange={onChange}
        />
    );
};

interface MultiSelectFieldProps {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
}

export const MultiSelectField = ({ label, options, selected, onChange, placeholder }: MultiSelectFieldProps) => {
    return (
        <MultiSelect
            label={label}
            options={options}
            selected={selected}
            onChange={onChange}
            placeholder={placeholder}
        />
    );
};

interface ListFieldProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

export const ListField = ({ label, value, onChange, placeholder = "Enter value..." }: ListFieldProps) => {
    const [items, setItems] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");

    // Parse JSON value to items array
    useEffect(() => {
        try {
            if (value && value.trim()) {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    setItems(parsed.map(String));
                } else {
                    setItems([]);
                }
            } else {
                setItems([]);
            }
        } catch {
            setItems([]);
        }
    }, [value]);

    const addItem = () => {
        if (!inputValue.trim()) return;
        const newItems = [...items, inputValue.trim()];
        setItems(newItems);
        setInputValue("");
        onChange(JSON.stringify(newItems));
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        onChange(JSON.stringify(newItems));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addItem();
        }
    };

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs text-gray-200 font-semibold font-semibold uppercase tracking-wide">
                {label}
            </label>
            
            {/* Items display */}
            {items.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-[var(--color-dark-glass)] border border-dark rounded-lg min-h-[40px]">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-1 px-2 py-1 glass-panel border border-pink-500/50 rounded text-xs text-white font-bold drop-shadow-sm"
                        >
                            <span className="max-w-[120px] truncate">{item}</span>
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-gray-200 font-semibold hover:text-[#ff0000] transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Add new item */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 glass-panel border border-pink-500/50 hover:border-pink-500/50 focus:border border-emerald-500/50 rounded-lg px-3 py-2 text-sm text-white font-bold drop-shadow-sm placeholder-gray focus:outline-none transition-colors"
                />
                <button
                    type="button"
                    onClick={addItem}
                    disabled={!inputValue.trim()}
                    className="flex items-center gap-1 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-md border border border-emerald-500/50 hover:bg-teal/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-emerald-400 transition-colors"
                >
                    <Plus size={14} />
                    <span className="text-xs font-medium">Add</span>
                </button>
            </div>
            
            {items.length === 0 && (
                <p className="text-[10px] text-gray-200 font-semibold italic">No items yet. Add one above.</p>
            )}
        </div>
    );
};

