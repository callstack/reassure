import * as fs from 'fs/promises';
import * as logger from '@callstack/reassure-logger';
import { config } from './config';
import type { MeasureResult, MeasureType } from './types';

export async function writeTestStats(
  results: MeasureResult,
  type: MeasureType,
  outputFilePath: string = config.outputFile
): Promise<void> {
  const name = expect.getState().currentTestName;
  const line = JSON.stringify({ name, type, ...results }) + '\n';

  try {
    await fs.appendFile(outputFilePath, line);
  } catch (error) {
    logger.error(`Error writing ${outputFilePath}`, error);
    throw error;
  }
}

export async function clearTestStats(outputFilePath: string = config.outputFile): Promise<void> {
  try {
    await fs.unlink(outputFilePath);
  } catch (error) {
    logger.warn(`Cannot remove ${outputFilePath}. File doesn't exist or cannot be removed`);
  }
}

let hasShownFlagsOutput = false;

export function showFlagsOutputIfNeeded() {
  if (hasShownFlagsOutput) {
    return;
  }

  if (!global.gc) {
    logger.error(
      '❌ Measure code is running under incorrect Node.js configuration.\n' +
        'Performance test code should be run in Jest with certain Node.js flags to increase measurements stability.\n' +
        'Make sure you use the Reassure CLI and run it using "reassure" command.'
    );
  } else {
    logger.verbose('Measure code is running with correct Node.js configuration.');
  }

  hasShownFlagsOutput = true;
}

export function resetHasShownFlagsOutput() {
  hasShownFlagsOutput = false;
}
