import { Button } from "./Button";

interface PaginationBarProps {
    /** Zero-indexed current page. */
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPrev: () => void;
    onNext: () => void;
}

/**
 * "Showing X-Y of Z" + Prev/Next controls. ResultTable had two
 * copy-pasted instances of this (DataFrame view and Series view) —
 * the Series one's "Next" button was actually a pasted-over duplicate
 * of "Prev" (same label, same `page - 1` handler, same `page === 0`
 * disabled check), so paginating past a Series result's first page was
 * impossible. One implementation now, so that bug class can't recur.
 */
export function PaginationBar({ page, totalPages, totalItems, pageSize, onPrev, onNext }: PaginationBarProps) {
    if (totalPages <= 1) return null;

    const start = page * pageSize + 1;
    const end = Math.min((page + 1) * pageSize, totalItems);

    return (
        <div className="flex items-center justify-between mt-1 select-none">
            <span className="text-[10px] text-gray-200 font-semibold">
                Mostrando {start}–{end} de {totalItems}
            </span>
            <div className="flex items-center gap-1">
                <Button
                    className="min-w-0 px-2 h-7 glass-panel text-white font-bold drop-shadow-sm"
                    isDisabled={page === 0}
                    onPress={onPrev}
                >
                    Prev
                </Button>
                <span className="text-xs text-gray-200 font-semibold px-2">
                    {page + 1} / {totalPages}
                </span>
                <Button
                    className="min-w-0 px-2 h-7 glass-panel text-white font-bold drop-shadow-sm"
                    isDisabled={page >= totalPages - 1}
                    onPress={onNext}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
