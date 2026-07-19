import { Modal } from "@heroui/react";
import { AlertCircle } from "lucide-react";
import type { ExecutionResult } from "../../shared/types/ast_types";
import { OutputTabsBar } from "./result-table/OutputTabsBar";
import { ViewModeSwitch } from "./result-table/ViewModeSwitch";
import { ResultHeaderInfo } from "./result-table/ResultHeaderInfo";
import { PolarsExplanationBanner } from "./result-table/PolarsExplanationBanner";
import { SeriesResultView } from "./result-table/SeriesResultView";
import { DataFrameResultView } from "./result-table/DataFrameResultView";
import { SqlModeView } from "./result-table/SqlModeView";
import { PlotModeView } from "./result-table/PlotModeView";
import { ResultModalFooter } from "./result-table/ResultModalFooter";
import { useResultViewState } from "./result-table/hooks/useResultViewState";
import { useResultPagination } from "./result-table/hooks/useResultPagination";

interface ResultTableProps {
    result: ExecutionResult | null;
    error: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const PAGE_SIZE = 15;

export const ResultTable = ({ result, error, isOpen, onClose }: ResultTableProps) => {
    const {
        results,
        selected,
        isSeriesResult,
        viewMode,
        setViewMode,
        selectedIndex,
        setSelectedIndex,
    } = useResultViewState(result, isOpen);

    const {
        page,
        paginatedRows,
        totalPages,
        totalRows,
        paginatedValues,
        seriesTotalPages,
        seriesTotalValues,
        goToPrevPage,
        goToNextPage,
    } = useResultPagination(selected, isOpen, PAGE_SIZE);

    const columns = selected?.columns ?? [];

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Modal.Backdrop className="glass-panel backdrop-blur-sm z-[2000] fixed inset-0" />
            <Modal.Container className="z-[2001] fixed inset-0 !flex !items-center !justify-center p-4">
                <Modal.Dialog className="glass-panel border border-2 border-blue-500/50 rounded-2xl text-white font-bold drop-shadow-sm max-w-[900px] w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden focus:outline-none relative mx-auto my-auto">
                    <Modal.CloseTrigger className="absolute top-4 right-4 p-1.5 rounded-lg glass-panel hover:glass-panel text-gray-200 font-semibold hover:text-white font-bold drop-shadow-sm transition-colors focus:outline-none cursor-pointer" />
                    <Modal.Header className="border-b border-2 border-blue-500/50 p-5 shrink-0 flex flex-col gap-4">
                        <ResultHeaderInfo results={results} selected={selected} isSeriesResult={isSeriesResult} />

                        {/* Output tabs — only shown for a multi-output graph */}
                        <OutputTabsBar results={results} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />

                        <ViewModeSwitch viewMode={viewMode} hasPlot={!!selected?.plot} onChange={setViewMode} />
                    </Modal.Header>

                    <Modal.Body className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 glass-panel/10">
                        {/* Global execution error (Polars/General) */}
                        {error && viewMode === "polars" && (
                            <div className="p-3 bg-[#ff0000]/20 shadow-md shadow-rose-500/20 border border-red/30 rounded-xl text-[#ff0000] text-sm">
                                <p className="font-bold flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Error de Ejecución Polars</p>
                                <pre className="mt-1 text-xs font-mono whitespace-pre-wrap">{error}</pre>
                            </div>
                        )}

                        {/* POLARS MODE CONTENT */}
                        {viewMode === "polars" && (
                            <>
                                {selected && !error && (
                                    <PolarsExplanationBanner
                                        isSeriesResult={isSeriesResult}
                                        isMultiOutput={results.length > 1}
                                        selectedName={selected.name}
                                    />
                                )}

                                {isSeriesResult && selected && (
                                    <SeriesResultView
                                        name={selected.name}
                                        dtype={selected.seriesDtype}
                                        page={page}
                                        pageSize={PAGE_SIZE}
                                        paginatedValues={paginatedValues}
                                        totalPages={seriesTotalPages}
                                        totalValues={seriesTotalValues}
                                        onPrevPage={goToPrevPage}
                                        onNextPage={() => goToNextPage(seriesTotalPages)}
                                    />
                                )}

                                {!isSeriesResult && columns.length > 0 && (
                                    <DataFrameResultView
                                        columns={columns}
                                        paginatedRows={paginatedRows}
                                        page={page}
                                        pageSize={PAGE_SIZE}
                                        totalPages={totalPages}
                                        totalRows={totalRows}
                                        onPrevPage={goToPrevPage}
                                        onNextPage={() => goToNextPage(totalPages)}
                                    />
                                )}
                            </>
                        )}

                        {/* SQL MODE CONTENT (global — not per-output: Tsubasa doesn't compute a
                            separate AST/SQL per graph sink today) */}
                        {viewMode === "sql" && (
                            <SqlModeView astTree={result?.ast_tree} sql={result?.sql} sqlError={result?.sql_error} />
                        )}

                        {/* PLOT MODE CONTENT */}
                        {viewMode === "plot" && selected?.plot && (
                            <PlotModeView plotHtml={selected.plot} />
                        )}
                    </Modal.Body>

                    <ResultModalFooter
                        prunedXmlPath={result?.prunedXmlPath}
                        pruningError={result?.pruningError}
                        onClose={onClose}
                    />
                </Modal.Dialog>
            </Modal.Container>
        </Modal>
    );
};
