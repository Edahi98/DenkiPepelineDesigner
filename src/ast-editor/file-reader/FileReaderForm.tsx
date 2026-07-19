import React from "react";
import { FolderSearch, FileText, Loader2, AlertTriangle, Database } from "lucide-react";
import { ActionButton } from "../../shared/atoms/ActionButton";
import { useFileBrowse } from "../../shared/hooks/useFileBrowse";
import { FILE_READER_EXTENSIONS } from "./constants";

interface FileReaderFormProps {
    path: string;
    ext: string | null;
    isLoading: boolean;
    loaded: boolean;
    previewCount: number;
    error: string | null;
    onPathChange: (path: string) => void;
    onLoad: () => void;
    onSwitchToScan?: () => void;
}

export const FileReaderForm = (props: FileReaderFormProps) => {
    const handleBrowse = useFileBrowse(FILE_READER_EXTENSIONS, props.onPathChange);

    return (
        <div className="flex flex-col gap-4 mb-4 p-5 border border-blue/30 bg-blue/10 rounded-xl shadow-[0_0_15px_rgba(28,117,158,0.1)]">
            <div className="flex flex-col gap-2">
                <ActionButton icon={<FolderSearch className="w-4 h-4" />} onClick={handleBrowse} tone="blue">
                    Browse File...
                </ActionButton>

                {props.path && (
                    <div className="text-sm bg-blue-500/10 hover:bg-blue-500/20 shadow-md border border-blue/30 p-3 rounded-lg text-blue-400">
                        <strong className="text-pink-400">Selected: </strong>
                        <FileText className="inline w-3.5 h-3.5 mr-1 text-blue-400" />
                        {props.path.split(/[\\/]/).pop()}
                        <br />
                        <span className="text-blue-400/70 text-xs">{props.path}</span>
                    </div>
                )}

                <input
                    type="text"
                    value={props.path}
                    onChange={(e) => props.onPathChange(e.target.value)}
                    placeholder="…or paste a file path"
                    className="w-full glass-panel border border-dark focus:border border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white font-bold drop-shadow-sm placeholder-gray focus:outline-none transition-colors"
                />
            </div>

            <ActionButton
                icon={props.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                onClick={props.onLoad}
                disabled={!props.path || props.isLoading}
                tone="blue"
            >
                {props.isLoading ? "Loading..." : "Load File"}
            </ActionButton>

            {props.error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[#ff0000]/20 shadow-md shadow-rose-500/20 border border-red/30 text-[#ff0000] text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{props.error}</span>
                </div>
            )}

            {props.loaded && !props.error && (
                <div className="text-xs text-emerald-400 bg-teal/15 border border-teal/30 rounded-lg p-2.5">
                    Loaded <strong>{props.previewCount}</strong> values into the
                    <code className="mx-1 px-1.5 py-0.5 rounded glass-panel text-emerald-400 font-mono">
                        dato
                    </code>
                    column.
                </div>
            )}

            {props.onSwitchToScan && (
                <ActionButton icon={<Database className="w-4 h-4" />} onClick={props.onSwitchToScan} tone="teal" className="mt-2">
                    Ingresar datos manual
                </ActionButton>
            )}
        </div>
    );
};
