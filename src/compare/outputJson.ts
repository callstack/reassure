import * as fs from 'fs/promises';
import * as path from 'path';
import type { CompareResult } from './types';

export async function writeToJson(filePath: string, data: CompareResult) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    console.log(`✅  Written JSON output file ${filePath}`);
    console.log(`🔗 ${path.resolve(filePath)}`);
  } catch (error) {
    console.log(`❌  Could not write JSON output file ${filePath}`);
    console.log(`🔗 ${path.resolve(filePath)}`);
    console.error(error);
  }
}
