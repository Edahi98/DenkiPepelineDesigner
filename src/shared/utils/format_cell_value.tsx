import type { ReactNode } from "react";

/**
 * Renders an arbitrary cell value from a DataFrame/Series row: null,
 * a JSON-looking string (parsed and pretty-printed), a primitive array
 * (joined inline), a nested array/object (recursively rendered), or a
 * plain scalar. Generic enough to reuse anywhere a table needs to show
 * loosely-typed tabular data, not just ResultTable.
 */
export function formatCellValue(val: any): ReactNode {
    if (val === null || val === undefined) return <span className="text-gray-200 font-semibold italic">null</span>;

    let parsed = val;
    if (typeof val === 'string') {
        try {
            const trimmed = val.trim();
            // Only try parsing if it looks like an array or object string representation
            if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
                parsed = JSON.parse(trimmed);
            }
        } catch {
            // Keep original string if it can't be parsed
            parsed = val;
        }
    }

    if (typeof parsed === 'object' && parsed !== null) {
        if (Array.isArray(parsed)) {
            if (parsed.length === 0) return <span className="text-gray-200 font-semibold">[]</span>;

            // If it's an array of plain primitives, join them cleanly instead of putting each in a heavy card
            const isPrimitiveArray = parsed.every(item => typeof item !== 'object' || item === null);
            if (isPrimitiveArray) {
                return <span className="text-white font-bold drop-shadow-sm">[{parsed.join(", ")}]</span>;
            }

            return (
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
                    {parsed.map((item, idx) => (
                        <div key={idx} className="glass-panel p-1.5 rounded border border-pink-500/50/50 text-[10px]">
                            {formatCellValue(item)}
                        </div>
                    ))}
                </div>
            );
        } else {
            return (
                <div className="flex flex-col gap-0.5 text-[10px]">
                    {Object.keys(parsed).map(key => (
                        <div key={key} className="flex gap-1 items-start">
                            <span className="text-gray-200 font-semibold font-bold">{key}:</span>
                            <span className="text-blue-400 break-all">{formatCellValue(parsed[key])}</span>
                        </div>
                    ))}
                </div>
            );
        }
    }

    return <span>{String(parsed)}</span>;
}
