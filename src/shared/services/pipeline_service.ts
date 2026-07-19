import { ExecutionResult } from "../types/ast_types";
import { desktopAdapter } from "../adapters/desktop-adapter";

class PipelineService {
    async execute(pipeline: any, testFilePath?: string): Promise<ExecutionResult> {
        try {
            return await desktopAdapter.executePipeline(pipeline, testFilePath);
        } catch (err: any) {
            const msg = err.traceback ? `${err.error}\n\nTraceback:\n${err.traceback}` : (err.error || "Pipeline execution failed");
            throw new Error(msg);
        }
    }
}

export const pipelineService = new PipelineService();
