import { ipcMain } from 'electron';
import type { ApiClient } from '../services/api-client';
import type { DocumentProcessorService } from '../services/document-processor';
import type { PythonInterpreter } from '../services/python-interpreter';
import { PruningOrchestrator } from '../services/pruning-orchestrator';
import { IPC_CHANNELS } from '../../shared/ipc-channels';

export function registerApiHandlers(
  apiClient: ApiClient,
  documentProcessor: DocumentProcessorService,
  interpreter: PythonInterpreter,
): void {
  const pruningOrchestrator = new PruningOrchestrator(documentProcessor, interpreter);

  ipcMain.handle(IPC_CHANNELS.apiExecutePipeline, async (_, pipeline: any, testFilePath?: string) => {
    // 1. Ejecutar el pipeline (orquestación normal de Bulma)
    const res = await apiClient.tsubasa.post('/execute', pipeline);
    const executionResult = res.data;

    // 2. Si hay un documento de prueba, convertir a XML y podar
    if (testFilePath) {
      try {
        executionResult.prunedXmlPath = await pruningOrchestrator.pruneAgainstExecutionResult(testFilePath, executionResult);
      } catch (err: any) {
        console.error('Error al procesar/podar el documento de prueba:', err);
        executionResult.pruningError = err.message || String(err);
      }
    }

    return executionResult;
  });
}
