import type { PythonInterpreter } from '../services/python-interpreter';
import { PythonScriptBuilder } from './python-script-builder';

export interface PythonScriptParts {
  imports: string;
  setup: string;
  logic: string;
  output: string;
}

/**
 * Assembles a Python script from its parts, runs it through the shared
 * interpreter, and parses its JSON stdout — the "assemble → run → parse
 * → normalize error" skeleton that XMLExtractor, XMLPruner, and
 * DatasetExtractor each used to duplicate independently. Every script
 * family funnels its result (or `{"error": "..."}`) through this same
 * contract, so a new script type only needs its own `PythonScriptParts`
 * and error prefix, never a copy of this wrapper.
 */
export async function runPythonScript<T>(
  interpreter: PythonInterpreter,
  parts: PythonScriptParts,
  errorPrefix: string,
): Promise<T> {
  const code = new PythonScriptBuilder()
    .addImports(parts.imports)
    .addSetup(parts.setup)
    .addExtractionLogic(parts.logic)
    .setOutput(parts.output)
    .build();

  try {
    const output = await interpreter.runCode(code);
    const parsed = JSON.parse(output.trim());

    if (parsed && !Array.isArray(parsed) && parsed.error) {
      throw new Error(parsed.error);
    }

    return parsed as T;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`${errorPrefix}: ${msg}`);
  }
}
