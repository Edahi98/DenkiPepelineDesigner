import { spawn, execFile } from 'child_process';
import path from 'path';

export class PythonInterpreter {
  private pythonExePath: string;

  constructor(resourcesPath: string) {
    // Resolver la ruta al ejecutable de Python incrustado
    this.pythonExePath = path.join(
      resourcesPath,
      'bin',
      'python-3.13.14-embed-amd64',
      'python.exe'
    );
  }

  /**
   * Ejecuta un script de Python con los argumentos proporcionados.
   * @param scriptPath Ruta absoluta al script de Python.
   * @param args Argumentos adicionales a pasar al script.
   * @returns Promesa que resuelve con la salida estándar (stdout) o rechaza con el error (stderr).
   */
  public async runScript(scriptPath: string, args: string[] = []): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(this.pythonExePath, [scriptPath, ...args], (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Error ejecutando Python: ${error.message}\nStderr: ${stderr}`));
          return;
        }
        resolve(stdout);
      });
    });
  }

  /**
   * Ejecuta código de Python directamente usando el argumento -c.
   * @param code El código Python a ejecutar.
   * @returns Promesa que resuelve con la salida estándar (stdout).
   */
  public async runCode(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(this.pythonExePath, ['-c', code], { maxBuffer: 1024 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Error ejecutando código Python: ${error.message}\nStderr: ${stderr}`));
          return;
        }
        resolve(stdout);
      });
    });
  }

  /**
   * Spawnea un proceso largo de Python (como un servidor o proceso en background).
   * @param args Argumentos a pasar al intérprete.
   * @returns La instancia de ChildProcess.
   */
  public spawnProcess(args: string[]): ReturnType<typeof spawn> {
    return spawn(this.pythonExePath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  }
}
