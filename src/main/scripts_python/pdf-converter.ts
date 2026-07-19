import type { PythonInterpreter } from '../services/python-interpreter';
import { PythonScriptBuilder } from './python-script-builder';
import { PDF_CONVERTER_IMPORTS, getPdfConverterLogic } from './pdf-converter-strings';

export class PDFConverter {
  private interpreter: PythonInterpreter;

  constructor(interpreter: PythonInterpreter) {
    this.interpreter = interpreter;
  }

  /**
   * Convierte un archivo PDF a DOCX ejecutando el script proporcionado.
   * @param pdfPath Ruta absoluta del archivo PDF de origen.
   * @returns La ruta absoluta del archivo DOCX generado.
   */
  public async convertToDocx(pdfPath: string): Promise<string> {
    if (!pdfPath.toLowerCase().endsWith('.pdf')) {
      throw new Error('El archivo proporcionado no es un PDF válido.');
    }

    const wordPath = pdfPath.substring(0, pdfPath.lastIndexOf('.pdf')) + '.docx';

    const code = new PythonScriptBuilder()
      .addImports(PDF_CONVERTER_IMPORTS)
      .addExtractionLogic(getPdfConverterLogic(pdfPath, wordPath))
      .build();

    await this.interpreter.runCode(code);

    return wordPath;
  }
}
