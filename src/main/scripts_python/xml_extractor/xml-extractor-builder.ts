import { PythonScriptRunnerBuilder } from '../python-script-runner-builder';
import { XMLExtractor } from './xml-extractor';

/**
 * Patrón Builder para inicializar la clase XMLExtractor.
 */
export class XMLExtractorBuilder extends PythonScriptRunnerBuilder<XMLExtractor> {
  private xmlPath = '';

  public setXmlPath(path: string): this {
    this.xmlPath = path;
    return this;
  }

  public build(): XMLExtractor {
    const interpreter = this.requireInterpreter('XMLExtractorBuilder');
    const xmlPath = this.requireField('XMLExtractorBuilder', 'xmlPath', this.xmlPath);

    return new XMLExtractor(interpreter, xmlPath);
  }
}
