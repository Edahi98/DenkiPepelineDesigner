import type { PythonInterpreter } from '../../services/python-interpreter';
import { runPythonScript } from '../run-python-script';
import {
  DATASET_EXTRACTOR_IMPORTS,
  getDatasetExtractorSetup,
  DATASET_EXTRACTOR_LOGIC,
  DATASET_PREVIEW_LOGIC,
  DATASET_EXTRACTOR_OUTPUT
} from './scripts_strings';

export class DatasetExtractor {
  private interpreter: PythonInterpreter;

  constructor(interpreter: PythonInterpreter) {
    this.interpreter = interpreter;
  }

  public async getColumns(filePath: string): Promise<string[]> {
    return runPythonScript<string[]>(
      this.interpreter,
      {
        imports: DATASET_EXTRACTOR_IMPORTS,
        setup: getDatasetExtractorSetup(filePath),
        logic: DATASET_EXTRACTOR_LOGIC,
        output: DATASET_EXTRACTOR_OUTPUT,
      },
      'DatasetExtractor Error',
    );
  }

  public async getPreview(filePath: string): Promise<Record<string, any[]>> {
    return runPythonScript<Record<string, any[]>>(
      this.interpreter,
      {
        imports: DATASET_EXTRACTOR_IMPORTS,
        setup: getDatasetExtractorSetup(filePath),
        logic: DATASET_PREVIEW_LOGIC,
        output: DATASET_EXTRACTOR_OUTPUT,
      },
      'DatasetExtractor Preview Error',
    );
  }
}
