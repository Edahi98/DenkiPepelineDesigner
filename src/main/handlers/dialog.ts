import { ipcMain, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import { IPC_CHANNELS } from '../../shared/ipc-channels';

export function registerDialogHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.dialogSelectFile, async (_, extensions?: string[]) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;

    const filters = extensions && extensions.length > 0
      ? [
          { name: 'Supported Files', extensions },
          { name: 'All Files', extensions: ['*'] }
        ]
      : [
          { name: 'Documents', extensions: ['docx', 'doc', 'pdf', 'xls', 'xlsx', 'csv', 'parquet'] },
          { name: 'All Files', extensions: ['*'] },
        ];

    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters,
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle(IPC_CHANNELS.dialogSelectSavePath, async (_, type: string, saveType: string) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;
    const result = await dialog.showSaveDialog(win, {
      defaultPath: `export.${saveType === 'Excel' ? 'xlsx' : saveType === 'HTML' ? 'html' : 'csv'}`,
    });
    return result.canceled ? null : result.filePath;
  });

  ipcMain.handle(IPC_CHANNELS.fileSave, async (_, content: string, filename: string) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;
    const result = await dialog.showSaveDialog(win, { defaultPath: filename });
    if (!result.canceled && result.filePath) {
      await fs.promises.writeFile(result.filePath, content, 'utf-8');
    }
  });

  ipcMain.handle(IPC_CHANNELS.dialogDownloadFile, async (_, sourcePath: string, defaultName?: string) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;
    const result = await dialog.showSaveDialog(win, {
      defaultPath: defaultName || 'document.xml',
      filters: [{ name: 'XML Files', extensions: ['xml'] }, { name: 'All Files', extensions: ['*'] }]
    });
    if (!result.canceled && result.filePath) {
      await fs.promises.copyFile(sourcePath, result.filePath);
    }
  });
}
