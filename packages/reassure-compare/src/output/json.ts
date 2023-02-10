import * as fs from 'fs/promises';
import * as path from 'path';
import type { CompareResult } from '../types';
import { logger } from '../utils/logger';

export async function writeToJson(filePath: string, data: CompareResult) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    logger.log(`✅  Written JSON output file ${filePath}`);
    logger.log(`🔗 ${path.resolve(filePath)}\n`);
  } catch (error) {
    logger.error(`❌  Could not write JSON output file ${filePath}`);
    logger.error(`🔗 ${path.resolve(filePath)}`);
    logger.error(error);
    throw error;
  }
}
