import type { PythonInterpreter } from '../services/python-interpreter';

/**
 * Shared base for the "assemble a runner object" builders (XMLExtractorBuilder,
 * XMLPrunerBuilder, ...). Each subclass only adds its own fields; the
 * interpreter dependency and required-field validation live here once
 * instead of being copy-pasted per builder.
 *
 * The interpreter is injected via `setInterpreter` rather than built from a
 * `resourcesPath` internally — callers share one `PythonInterpreter` per
 * process (constructed at the composition root) instead of each builder
 * spinning up its own.
 */
export abstract class PythonScriptRunnerBuilder<TRunner> {
  protected interpreter?: PythonInterpreter;

  public setInterpreter(interpreter: PythonInterpreter): this {
    this.interpreter = interpreter;
    return this;
  }

  protected requireInterpreter(builderName: string): PythonInterpreter {
    if (!this.interpreter) {
      throw new Error(`interpreter is required for ${builderName}`);
    }
    return this.interpreter;
  }

  protected requireField(builderName: string, fieldName: string, value: string): string {
    if (!value) {
      throw new Error(`${fieldName} is required for ${builderName}`);
    }
    return value;
  }

  public abstract build(): TRunner;
}
