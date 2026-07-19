import type { DocumentProcessorService } from './document-processor';
import type { PythonInterpreter } from './python-interpreter';
import { XMLPrunerBuilder } from '../scripts_python/xml_pruner/xml-pruner-builder';

/**
 * Given a test document and the pipeline's execution result, generates
 * the document's XML and prunes it down to the nodes whose text appears
 * in the actual pipeline output. Pulled out of the `api:execute-pipeline`
 * IPC handler, which used to inline this — instantiating its own
 * `DocumentProcessorService`/`XMLPrunerBuilder` and parsing the result
 * shape itself — instead of receiving its collaborators injected like
 * every other handler in `main/handlers/`.
 */
export class PruningOrchestrator {
  constructor(
    private documentProcessor: DocumentProcessorService,
    private interpreter: PythonInterpreter,
  ) {}

  async pruneAgainstExecutionResult(testFilePath: string, executionResult: any): Promise<string> {
    const xmlPath = await this.documentProcessor.generateXml(testFilePath);
    const validDataJson = JSON.stringify(extractValidData(executionResult));

    const pruner = new XMLPrunerBuilder()
      .setInterpreter(this.interpreter)
      .setXmlPath(xmlPath)
      .setValidDataJson(validDataJson)
      .build();

    return pruner.pruneXml();
  }
}

/**
 * Tsubasa's `/execute` response shape varies with what the pipeline's
 * sink produces: a dataframe result, a bare series result, or (for a
 * multi-output graph) a map of named outputs whose first entry is
 * whichever of the two shapes above. This flow only ever prunes against
 * a single meaningful sink, so the first output is enough.
 */
function extractValidData(executionResult: any): any {
  if (executionResult.dataframe?.data) {
    return executionResult.dataframe.data;
  }
  if (executionResult.series?.values) {
    return executionResult.series.values;
  }
  if (executionResult.outputs) {
    const firstOutput = Object.values(executionResult.outputs)[0] as any;
    if (firstOutput?.data) return firstOutput.data;
    if (firstOutput?.values) return firstOutput.values;
  }
  return {};
}
