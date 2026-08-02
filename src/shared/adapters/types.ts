export interface DesktopAdapter {
  selectFile(extensions?: string[]): Promise<string | null>;
  selectSavePath(type: string, saveType: string): Promise<string | null>;
  saveFile(content: string, filename: string): Promise<void>;
  startBackends(): Promise<void>;
  stopBackends(): Promise<void>;
  getBackendStatus(): Promise<Record<string, boolean>>;
  executePipeline(pipeline: any, testFilePath?: string): Promise<any>;
  processDocument(filePath: string): Promise<string[]>;
  getDatasetColumns(filePath: string): Promise<string[]>;
  getDatasetPreview(filePath: string): Promise<Record<string, any[]>>;
  getDatasetColumnValues(filePath: string, column: string): Promise<any[]>;
  downloadFile(sourcePath: string, defaultName?: string): Promise<void>;
}
