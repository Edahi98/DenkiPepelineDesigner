import type { PythonInterpreter } from '../../services/python-interpreter';
import { runPythonScript } from '../run-python-script';
import {
  XML_EXTRACTOR_IMPORTS,
  getXmlExtractorSetup,
  XML_EXTRACTOR_LOGIC,
  XML_EXTRACTOR_OUTPUT
} from './scripts_strings';

export class XMLExtractor {
  private interpreter: PythonInterpreter;
  private xmlPath: string;

  constructor(interpreter: PythonInterpreter, xmlPath: string) {
    this.interpreter = interpreter;
    this.xmlPath = xmlPath;
  }

  /**
   * Extrae las tablas de un archivo XML usando el Script Builder
   * para evitar un solo bloque gigante de código.
   */
  public async extractTables(): Promise<string[]> {
    return runPythonScript<string[]>(
      this.interpreter,
      {
        imports: XML_EXTRACTOR_IMPORTS,
        setup: getXmlExtractorSetup(this.xmlPath),
        logic: XML_EXTRACTOR_LOGIC,
        output: XML_EXTRACTOR_OUTPUT,
      },
      'XMLExtractor Error',
    );
  }
}
