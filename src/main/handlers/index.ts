import { registerDialogHandlers } from './dialog';
import { registerBackendHandlers } from './backend';
import { registerApiHandlers } from './api';
import { registerDocumentHandlers } from './document';
import { registerDatasetHandlers } from './dataset';
import type { BackendManager } from '../services/backend-manager';
import type { ApiClient } from '../services/api-client';
import type { BackendPorts } from '../config';
import type { DocumentProcessorService } from '../services/document-processor';
import type { DatasetExtractor } from '../scripts_python/dataset_extractor/dataset-extractor';
import type { PythonInterpreter } from '../services/python-interpreter';

export function registerHandlers(
  backendManager: BackendManager,
  apiClient: ApiClient,
  ports: BackendPorts,
  documentProcessor: DocumentProcessorService,
  datasetExtractor: DatasetExtractor,
  interpreter: PythonInterpreter,
  resourcesPath: string
): void {
  registerDialogHandlers();
  registerBackendHandlers(backendManager, ports, resourcesPath);
  registerApiHandlers(apiClient, documentProcessor, interpreter);
  registerDocumentHandlers(documentProcessor);
  registerDatasetHandlers(datasetExtractor);
}
