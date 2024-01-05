import * as fs from 'fs/promises';
import * as path from 'path';
import * as logger from '@callstack/reassure-logger';
import type { CompareResult } from '../types';

export async function writeToJson(filePath: string, data: CompareResult) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    logger.log(`✅  Written JSON output file ${filePath}`);
    logger.log(`🔗 ${path.resolve(filePath)}\n`);
  } catch (error) {
    logger.error(`❌  Could not write JSON output file ${filePath}`);
    logger.error(`🔗 ${path.resolve(filePath)}`);
    logger.error('Error details:', error);
    throw error;
  }
}
