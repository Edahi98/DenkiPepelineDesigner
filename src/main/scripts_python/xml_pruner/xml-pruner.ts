import type { PythonInterpreter } from '../../services/python-interpreter';
import { runPythonScript } from '../run-python-script';
import {
  XML_PRUNER_IMPORTS,
  getXmlPrunerSetup,
  XML_PRUNER_LOGIC,
  XML_PRUNER_OUTPUT
} from './scripts_strings';

export class XMLPruner {
  private interpreter: PythonInterpreter;
  private xmlPath: string;
  private validDataJson: string;

  constructor(interpreter: PythonInterpreter, xmlPath: string, validDataJson: string) {
    this.interpreter = interpreter;
    this.xmlPath = xmlPath;
    this.validDataJson = validDataJson;
  }

  /**
   * Ejecuta la poda del archivo XML usando el Script Builder
   * respetando la arquitectura de la aplicación.
   */
  public async pruneXml(): Promise<string> {
    const result = await runPythonScript<{ output_path: string }>(
      this.interpreter,
      {
        imports: XML_PRUNER_IMPORTS,
        setup: getXmlPrunerSetup(this.xmlPath, this.validDataJson),
        logic: XML_PRUNER_LOGIC,
        output: XML_PRUNER_OUTPUT,
      },
      'XML Pruner Error',
    );

    return result.output_path;
  }
}
