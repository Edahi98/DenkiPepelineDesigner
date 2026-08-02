/**
 * Single source of truth for IPC channel names shared between
 * `preload.ts` (registers them on the renderer's `window.desktop`)
 * and `main/handlers/*.ts` (registers `ipcMain.handle` for each one).
 *
 * Before this existed, both sides redeclared the same channel strings
 * independently and could silently drift — e.g. `backends:start` was
 * invoked from the renderer but never had a matching `ipcMain.handle`.
 */
export const IPC_CHANNELS = {
  dialogSelectFile: 'dialog:selectFile',
  dialogSelectSavePath: 'dialog:selectSavePath',
  dialogDownloadFile: 'dialog:download-file',
  fileSave: 'file:save',
  backendsStart: 'backends:start',
  backendsStop: 'backends:stop',
  backendsStatus: 'backends:status',
  apiExecutePipeline: 'api:execute-pipeline',
  apiProcessDocument: 'api:process-document',
  datasetGetColumns: 'dataset:get-columns',
  datasetGetPreview: 'dataset:get-preview',
  datasetGetColumnValues: 'dataset:get-column-values',
} as const;
