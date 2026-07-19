/**
 * Builder auxiliar para construir scripts de Python dinámicamente
 * separando la lógica por responsabilidades.
 */
export class PythonScriptBuilder {
  private imports: string[] = [];
  private setup: string[] = [];
  private extractionLogic: string[] = [];
  private outputLogic: string[] = [];

  public addImports(code: string): this {
    this.imports.push(code.trim());
    return this;
  }

  public addSetup(code: string): this {
    this.setup.push(code.trim());
    return this;
  }

  public addExtractionLogic(code: string): this {
    this.extractionLogic.push(code.trim());
    return this;
  }

  public setOutput(code: string): this {
    this.outputLogic.push(code.trim());
    return this;
  }

  public build(): string {
    return [
      ...this.imports,
      ...this.setup,
      ...this.extractionLogic,
      ...this.outputLogic
    ].join('\n\n');
  }
}
