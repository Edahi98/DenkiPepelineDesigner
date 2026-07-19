interface PlotModeViewProps {
    plotHtml: string;
}

/** Renders a Bokeh plot's self-contained HTML in a sandboxed iframe. */
export function PlotModeView({ plotHtml }: PlotModeViewProps) {
    return (
        <div className="flex-1 w-full h-full bg-white rounded-xl overflow-hidden border border-blue-500/50 min-h-[400px]">
            <iframe
                srcDoc={plotHtml}
                className="w-full h-full border-none min-h-[400px]"
                title="Bokeh Plot"
                sandbox="allow-scripts allow-same-origin"
            />
        </div>
    );
}
