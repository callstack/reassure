/**
 * Util to read file content from path and filter file elements based on a JSON key
 */

import fs from 'fs/promises';

export async function readFileAndParseDataToFormat(path: string, keyToFilterWith: string) {
  const data = await fs.readFile(path, 'utf8');

  const lines = data.split(/\r?\n/);
  return lines
    .filter((line) => !!line.trim())
    .map((line) => JSON.parse(line))
    .filter((parsedJSON) => !!parsedJSON[keyToFilterWith]);
}
