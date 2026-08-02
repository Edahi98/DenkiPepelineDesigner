import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from './shared/ipc-channels';

contextBridge.exposeInMainWorld('desktop', {
  selectFile: (extensions?: string[]) => ipcRenderer.invoke(IPC_CHANNELS.dialogSelectFile, extensions),
  selectSavePath: (type: string, saveType: string) => ipcRenderer.invoke(IPC_CHANNELS.dialogSelectSavePath, type, saveType),
  saveFile: (content: string, filename: string) => ipcRenderer.invoke(IPC_CHANNELS.fileSave, content, filename),
  startBackends: () => ipcRenderer.invoke(IPC_CHANNELS.backendsStart),
  stopBackends: () => ipcRenderer.invoke(IPC_CHANNELS.backendsStop),
  getBackendStatus: () => ipcRenderer.invoke(IPC_CHANNELS.backendsStatus),
  executePipeline: (pipeline: any, testFilePath?: string) => ipcRenderer.invoke(IPC_CHANNELS.apiExecutePipeline, pipeline, testFilePath),
  processDocument: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.apiProcessDocument, filePath),
  getDatasetColumns: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.datasetGetColumns, filePath),
  getDatasetPreview: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.datasetGetPreview, filePath),
  getDatasetColumnValues: (filePath: string, column: string) => ipcRenderer.invoke(IPC_CHANNELS.datasetGetColumnValues, filePath, column),
  downloadFile: (sourcePath: string, defaultName?: string) => ipcRenderer.invoke(IPC_CHANNELS.dialogDownloadFile, sourcePath, defaultName),
});
