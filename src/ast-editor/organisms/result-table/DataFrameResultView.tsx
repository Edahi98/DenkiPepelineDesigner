import { PaginationBar } from "../../../shared/atoms/PaginationBar";
import { formatCellValue } from "../../../shared/utils/format_cell_value";

interface DataFrameResultViewProps {
    columns: string[];
    paginatedRows: Record<string, any>[];
    page: number;
    pageSize: number;
    totalPages: number;
    totalRows: number;
    onPrevPage: () => void;
    onNextPage: () => void;
}

export function DataFrameResultView({
    columns,
    paginatedRows,
    page,
    pageSize,
    totalPages,
    totalRows,
    onPrevPage,
    onNextPage,
}: DataFrameResultViewProps) {
    if (columns.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 mt-2">
            {columns.length === 1 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 max-h-[60vh] overflow-y-auto p-3 rounded-xl border border-2 border-blue-500/50 bg-black/30">
                    {paginatedRows.map((row, i) => {
                        const value = row[columns[0]];
                        return (
                            <div
                                key={i}
                                className="px-3 py-2.5 bg-[var(--color-dark-glass)] border border-2 border-blue-500/50 rounded-lg text-white font-bold drop-shadow-sm text-xs font-mono break-words"
                                title={value === null || value === undefined ? "null" : String(value)}
                            >
                                {value === null || value === undefined ? (
                                    <span className="text-gray-200 font-semibold italic">null</span>
                                ) : (
                                    String(value)
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="overflow-auto max-h-[40vh] rounded-xl border border-2 border-blue-500/50">
                    <table className="w-full text-xs text-left">
                        <thead>
                            <tr className="glass-panel sticky top-0">
                                <th className="px-3 py-2 font-semibold text-gray-200 font-semibold uppercase tracking-wider border-b border-2 border-blue-500/50 w-12">
                                    #
                                </th>
                                {columns.map((col) => (
                                    <th
                                        key={col}
                                        className="px-3 py-2 font-semibold text-emerald-400 uppercase tracking-wider border-b border-2 border-blue-500/50 whitespace-nowrap"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRows.map((row, i) => (
                                <tr
                                    key={i}
                                    className="hover:bg-gray/5 transition-colors border-b border border-violet-500/50"
                                >
                                    <td className="px-3 py-1.5 text-gray-200 font-semibold font-mono">
                                        {page * pageSize + i + 1}
                                    </td>
                                    {columns.map((col) => (
                                        <td
                                            key={col}
                                            className="px-3 py-1.5 text-white font-bold drop-shadow-sm font-mono whitespace-nowrap"
                                        >
                                            {formatCellValue(row[col])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <PaginationBar
                page={page}
                totalPages={totalPages}
                totalItems={totalRows}
                pageSize={pageSize}
                onPrev={onPrevPage}
                onNext={onNextPage}
            />
        </div>
    );
}
