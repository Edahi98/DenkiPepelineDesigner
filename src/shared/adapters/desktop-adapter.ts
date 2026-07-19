import type { DesktopAdapter } from './types';

const d = (window as any).desktop;

export const desktopAdapter: DesktopAdapter = {
  selectFile: (extensions?: string[]) => d.selectFile(extensions),
  selectSavePath: (type, saveType) => d.selectSavePath(type, saveType),
  saveFile: (content, filename) => d.saveFile(content, filename),
  startBackends: () => d.startBackends(),
  stopBackends: () => d.stopBackends(),
  getBackendStatus: () => d.getBackendStatus(),
  executePipeline: (pipeline, testFilePath) => d.executePipeline(pipeline, testFilePath),
  processDocument: (filePath) => d.processDocument(filePath),
  getDatasetColumns: (path) => d.getDatasetColumns(path),
  getDatasetPreview: (path) => d.getDatasetPreview(path),
  downloadFile: (sourcePath, defaultName) => d.downloadFile(sourcePath, defaultName),
};
