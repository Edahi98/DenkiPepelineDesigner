import { ipcMain } from 'electron';
import type { BackendManager } from '../services/backend-manager';
import type { BackendPorts } from '../config';
import { IPC_CHANNELS } from '../../shared/ipc-channels';

export function registerBackendHandlers(backendManager: BackendManager, ports: BackendPorts, resourcesPath: string): void {
  ipcMain.handle(IPC_CHANNELS.backendsStart, async () => {
    await backendManager.startAll(ports, resourcesPath);
  });

  ipcMain.handle(IPC_CHANNELS.backendsStop, () => {
    backendManager.stopAll();
  });

  ipcMain.handle(IPC_CHANNELS.backendsStatus, () => {
    return backendManager.getStatus();
  });
}
