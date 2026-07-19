import { app, BrowserWindow } from 'electron';
import path from 'path';
import { resolvePorts } from './main/config';
import { BackendManager } from './main/services/backend-manager';
import { createApiClient } from './main/services/api-client';
import { registerHandlers } from './main/handlers';
import { DocumentProcessorService } from './main/services/document-processor';
import { DatasetExtractor } from './main/scripts_python/dataset_extractor/dataset-extractor';
import { PythonInterpreter } from './main/services/python-interpreter';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) {
  app.quit();
}

let backendManager: BackendManager;
let apiClient: ReturnType<typeof createApiClient>;

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 700,
    width: 1200,
    minWidth: 900,
    minHeight: 500,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: 'rgba(0, 0, 0, 0)',
      symbolColor: '#ffffff',
      height: 36,
    },
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  //mainWindow.webContents.openDevTools();
};

app.on('ready', async () => {
  const ports = await resolvePorts();
  backendManager = new BackendManager();
  apiClient = createApiClient(ports);

  const resourcesPath = app.isPackaged
    ? path.join(process.resourcesPath)
    : path.join(process.cwd());

  const interpreter = new PythonInterpreter(resourcesPath);
  const documentProcessor = new DocumentProcessorService(interpreter, resourcesPath);
  const datasetExtractor = new DatasetExtractor(interpreter);

  registerHandlers(backendManager, apiClient, ports, documentProcessor, datasetExtractor, interpreter, resourcesPath);

  try {
    await backendManager.startAll(ports, resourcesPath);
  } catch (err) {
    console.error('Backend startup failed:', err);
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (backendManager) backendManager.stopAll();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
