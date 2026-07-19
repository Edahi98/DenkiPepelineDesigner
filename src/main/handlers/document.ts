import { ipcMain } from 'electron';
import type { DocumentProcessorService } from '../services/document-processor';
import { IPC_CHANNELS } from '../../shared/ipc-channels';

export function registerDocumentHandlers(documentProcessor: DocumentProcessorService): void {
  ipcMain.handle(IPC_CHANNELS.apiProcessDocument, async (_, filePath: string) => {
    return await documentProcessor.processDocument(filePath);
  });
}
