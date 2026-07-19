import React from "react";

import { FileReaderForm } from "./FileReaderForm";
import { useFileReader } from "./useFileReader";
import { FILE_READER_COLUMN_NAME } from "./constants";

interface FileReaderPanelProps {
    path: string;
    data: Record<string, any>;
    onFieldChange: (key: string, value: any) => void;
    onSwitchToScan?: () => void;
}

export const FileReaderPanel = (props: FileReaderPanelProps) => {
    const { state, ext, setPath, loadFile } = useFileReader();

    const handleLoad = async () => {
        const res = await loadFile();
        if (res) {
            props.onFieldChange("data", { [FILE_READER_COLUMN_NAME]: res.values });
        }
    };

    const previewCount = Array.isArray(props.data?.[FILE_READER_COLUMN_NAME])
        ? (props.data[FILE_READER_COLUMN_NAME] as unknown[]).length
        : 0;

    return (
        <FileReaderForm
            path={state.path || props.path}
            ext={ext}
            isLoading={state.isLoading}
            loaded={state.loaded}
            previewCount={previewCount}
            error={state.error}
            onPathChange={setPath}
            onLoad={handleLoad}
            onSwitchToScan={props.onSwitchToScan}
        />
    );
};
