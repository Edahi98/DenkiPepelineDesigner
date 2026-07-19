import { PythonScriptRunnerBuilder } from '../python-script-runner-builder';
import { XMLPruner } from './xml-pruner';

/**
 * Patrón Builder para inicializar la clase XMLPruner.
 */
export class XMLPrunerBuilder extends PythonScriptRunnerBuilder<XMLPruner> {
  private xmlPath = '';
  private validDataJson = '';

  public setXmlPath(path: string): this {
    this.xmlPath = path;
    return this;
  }

  public setValidDataJson(json: string): this {
    this.validDataJson = json;
    return this;
  }

  public build(): XMLPruner {
    const interpreter = this.requireInterpreter('XMLPrunerBuilder');
    const xmlPath = this.requireField('XMLPrunerBuilder', 'xmlPath', this.xmlPath);
    const validDataJson = this.requireField('XMLPrunerBuilder', 'validDataJson', this.validDataJson);

    return new XMLPruner(interpreter, xmlPath, validDataJson);
  }
}
