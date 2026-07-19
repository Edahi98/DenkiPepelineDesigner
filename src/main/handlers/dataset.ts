import { ipcMain } from 'electron';
import type { DatasetExtractor } from '../scripts_python/dataset_extractor/dataset-extractor';
import { IPC_CHANNELS } from '../../shared/ipc-channels';

export function registerDatasetHandlers(datasetExtractor: DatasetExtractor): void {
  ipcMain.handle(IPC_CHANNELS.datasetGetColumns, async (_, filePath: string) => {
    try {
      return await datasetExtractor.getColumns(filePath);
    } catch (error: any) {
      console.error('Error in dataset:get-columns:', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.datasetGetPreview, async (_, filePath: string) => {
    try {
      return await datasetExtractor.getPreview(filePath);
    } catch (error: any) {
      console.error('Error in dataset:get-preview:', error);
      throw error;
    }
  });
}
