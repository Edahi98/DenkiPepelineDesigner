import { Table2 } from "lucide-react";
import { PillTabButton } from "../../../shared/atoms/PillTabButton";
import type { NamedResult } from "./normalize-results";

interface OutputTabsBarProps {
    results: NamedResult[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}

/** Tab strip for picking which graph output to view — only shown for a multi-output graph. */
export function OutputTabsBar({ results, selectedIndex, onSelect }: OutputTabsBarProps) {
    if (results.length <= 1) return null;

    return (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {results.map((r, i) => (
                <PillTabButton
                    key={r.name}
                    icon={<Table2 className="w-3.5 h-3.5" />}
                    active={i === selectedIndex}
                    tone="emerald"
                    onClick={() => onSelect(i)}
                >
                    {r.name}
                </PillTabButton>
            ))}
        </div>
    );
}
