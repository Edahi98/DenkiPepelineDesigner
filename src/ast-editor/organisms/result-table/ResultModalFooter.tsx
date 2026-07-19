import { Modal } from "@heroui/react";
import { AlertCircle, Download } from "lucide-react";
import { Button } from "../../../shared/atoms/Button";
import { desktopAdapter } from "../../../shared/adapters/desktop-adapter";

interface ResultModalFooterProps {
    prunedXmlPath?: string;
    pruningError?: string;
    onClose: () => void;
}

export function ResultModalFooter({ prunedXmlPath, pruningError, onClose }: ResultModalFooterProps) {
    return (
        <Modal.Footer className="border-t border-2 border-blue-500/50 p-4 shrink-0 glass-panel flex justify-end gap-2">
            {prunedXmlPath && (
                <Button
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 border-none transition-all duration-300 h-9 px-4 rounded-lg flex items-center gap-2"
                    onPress={async () => {
                        const defaultName = prunedXmlPath.split(/[\\/]/).pop() || 'document_pruned.xml';
                        await desktopAdapter.downloadFile(prunedXmlPath, defaultName);
                    }}
                >
                    <Download className="w-4 h-4" />
                    Descargar XML Podado
                </Button>
            )}
            {pruningError && (
                <div className="flex-1 flex items-center gap-2 text-rose-400 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    Error de poda: {pruningError}
                </div>
            )}
            <Button
                className="glass-panel text-white font-bold drop-shadow-sm border border-pink-500/50/50 hover:bg-[var(--color-dark-glass)] h-9 px-4 rounded-lg"
                onPress={onClose}
            >
                Cerrar
            </Button>
        </Modal.Footer>
    );
}
