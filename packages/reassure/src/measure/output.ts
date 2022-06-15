import * as fs from 'fs/promises';
import { config } from './config';
import type { MeasureRenderResult } from './types';

export async function writeTestStats(
  result: MeasureRenderResult,
  outputFilePath: string = config.outputFile
): Promise<void> {
  const name = expect.getState().currentTestName;
  const line = JSON.stringify({ name, ...result }) + '\n';

  try {
    await fs.appendFile(outputFilePath, line);
  } catch (error) {
    console.error(`Error writing ${outputFilePath}`, error);
    throw error;
  }
}

export async function clearTestStats(outputFilePath: string = config.outputFile): Promise<void> {
  try {
    await fs.unlink(outputFilePath);
  } catch (error) {
    console.warn(`Cannot remove ${outputFilePath}. File doesn't exist or cannot be removed`);
  }
}
