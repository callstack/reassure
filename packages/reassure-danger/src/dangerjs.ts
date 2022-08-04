import * as fs from 'fs';
import * as path from 'path';

/**
 * Declaring dangerjs API methods used in the plugin
 * ---
 * @function warn(message: string): void;
 *  - displays a warning message in Danger's output in MR after CI pipeline finishes running
 *  - does NOT stop the pipeline run itself
 *  @function markdown(message: string): void;
 * - displays a markdown content in Danger's output in MR after CI pipeline finishes running
 * - allows for displaying messages in markdown format
 */
declare function warn(message: string): void;
declare function markdown(message: string): void;

/**
 * Configuration object which can optionally be passed down to plugin's call.
 * By default, it will only pass the inputFilePath parameter
 */
export type DangerPluginConfig = { inputFilePath: string; debug?: boolean };

export function dangerPlugin(
  config: DangerPluginConfig = {
    inputFilePath: '.reassure/output.md',
  }
) {
  const _warning = `
  ⚠️  No output file found @ ${config.inputFilePath}
  -------------------------------------------------------------
  Review reassure configuration and make sure your markdown output
  file can be found in the location shown above. Alternatively,
  you can pass your markdown output file location to plugin's
  config object in your dangerfile.
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
        warn(_warning);
      } else {
        markdown(perfFileContents);
      }
    }
  } catch (error) {
    console.error(_warning, error);
  }
}
