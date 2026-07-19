import { PaginationBar } from "../../../shared/atoms/PaginationBar";
import { formatCellValue } from "../../../shared/utils/format_cell_value";

interface SeriesResultViewProps {
    name: string;
    dtype: string;
    page: number;
    pageSize: number;
    paginatedValues: any[];
    totalPages: number;
    totalValues: number;
    onPrevPage: () => void;
    onNextPage: () => void;
}

export function SeriesResultView({
    name,
    dtype,
    page,
    pageSize,
    paginatedValues,
    totalPages,
    totalValues,
    onPrevPage,
    onNextPage,
}: SeriesResultViewProps) {
    return (
        <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-violet-400">
                    Series: &quot;{name}&quot;
                </span>
                <span className="text-[10px] bg-purple/30 text-violet-400 px-2 py-0.5 rounded-full border border-purple/20">
                    {dtype}
                </span>
            </div>
            <div className="overflow-auto max-h-[50vh] rounded-xl border border-2 border-blue-500/50">
                <table className="w-full text-xs text-left">
                    <thead>
                        <tr className="glass-panel sticky top-0">
                            <th className="px-3 py-2 font-semibold text-gray-200 font-semibold uppercase tracking-wider border-b border-2 border-blue-500/50 w-16">
                                Idx
                            </th>
                            <th className="px-3 py-2 font-semibold text-violet-400 uppercase tracking-wider border-b border-2 border-blue-500/50">
                                {name}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedValues.map((value, i) => (
                            <tr
                                key={i}
                                className="hover:bg-gray/5 transition-colors border-b border border-violet-500/50"
                            >
                                <td className="px-3 py-1.5 text-gray-200 font-semibold font-mono">
                                    {page * pageSize + i}
                                </td>
                                <td className="px-3 py-1.5 text-white font-bold drop-shadow-sm font-mono whitespace-nowrap">
                                    {formatCellValue(value)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationBar
                page={page}
                totalPages={totalPages}
                totalItems={totalValues}
                pageSize={pageSize}
                onPrev={onPrevPage}
                onNext={onNextPage}
            />
        </div>
    );
}
