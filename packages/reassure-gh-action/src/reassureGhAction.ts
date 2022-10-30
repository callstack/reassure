import * as fs from 'fs';
import * as path from 'path';

export type reassureGhActionConfig = { inputFilePath: string; debug?: boolean };

export function reassureGhAction(config: reassureGhActionConfig = { inputFilePath: '.reassure/output.md' }) {
  const _warning = `
  ⚠️  No output file found @ ${config.inputFilePath}
  -------------------------------------------------------------
  Review reassure configuration and make sure your markdown output
  file can be found in the location shown above.
  -------------------------------------------------------------
  `;

  try {
    const perfFilePath = path.resolve(config.inputFilePath);
    const perfFileContents = fs.readFileSync(perfFilePath, 'utf8');

    if (config.debug) {
      if (!perfFileContents) {
        console.log(_warning);
      } else {
        console.log(perfFileContents);
      }
    } else {
      if (!perfFileContents) {
        console.warn(_warning);
      } else {
        console.log(perfFileContents);
      }
    }
  } catch (error) {
    console.error(_warning, error);
  }
}
