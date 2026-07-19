import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import type { BackendPorts } from '../config';

export class BackendManager {
  private processes: Map<string, ChildProcess> = new Map();

  private getBinPath(name: string, resourcesPath: string): string {
    return path.join(resourcesPath, 'bin', `${name}.exe`);
  }

  private async start(name: string, exePath: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn(exePath, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      this.processes.set(name, proc);

      proc.stderr?.on('data', (data: Buffer) => {
        console.error(`[${name}] stderr: ${data.toString().trim()}`);
      });

      proc.stdout?.on('data', (data: Buffer) => {
        console.log(`[${name}] stdout: ${data.toString().trim()}`);
      });

      proc.on('error', (err) => {
        console.error(`[${name}] spawn error:`, err.message);
        reject(err);
      });

      proc.on('close', (code) => {
        if (code !== null && code !== 0) {
          console.error(`[${name}] exited with code ${code}`);
        }
      });

      setTimeout(resolve, 2000);
    });
  }

  async startAll(ports: BackendPorts, resourcesPath: string): Promise<void> {
    await this.start('tsubasa', this.getBinPath('tsubasa', resourcesPath), [
      '--port', String(ports.tsubasa.port),
      '--host', ports.tsubasa.host,
    ]);
  }

  stopAll(): void {
    for (const [name, proc] of this.processes) {
      proc.kill();
    }
    this.processes.clear();
  }

  getStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    for (const [name, proc] of this.processes) {
      status[name] = !proc.killed;
    }
    return status;
  }
}
