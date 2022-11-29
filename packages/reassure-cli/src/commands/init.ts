import { mkdirSync, copyFileSync, existsSync, readFileSync, appendFileSync } from 'fs';
import type { CommandModule } from 'yargs';

import { RESULTS_DIRECTORY, GITIGNORE_DATA } from '../constants';
import { printBye, printError, printHello, printLog, printWarn } from '../utils/printer';

type InitOptions = {
  logLevel?: string;
};
/**
 * @param args arguments which come from the CLI command when ran
 *
 * Main runner function for the init command for reassure-cli. It will create the .reassure directory
 * and copy the test shell script template over there. It will additionally copy over the dangerfile
 * template to the root folder and update .gitignore file if present and not already containing mentions
 * of reassure within it.
 */
async function run(args: InitOptions): Promise<void> {
  /**
   * reassinging printing functions for ease of use since args.logLevel is always required
   * to properly handle the logLevel option coming from the command.
   */
  const log = (...logs: string[]): void => printLog(args.logLevel, ...logs);
  const warn = (...logs: string[]): void => printWarn(args.logLevel, ...logs);
  const error = (...logs: string[]): void => printError(args.logLevel, ...logs);

  printHello();

  log('Checking if reassure setup exists');
  if (await existsSync(RESULTS_DIRECTORY)) {
    error('Reassure has already been initialized => exiting');
    return;
  }

  try {
    log('Creating the results directory');
    await mkdirSync(RESULTS_DIRECTORY);

    log('Copying the reassure-tests.sh template file');
    await copyFileSync(`${__dirname}/../templates/reassure-tests.sh`, `${RESULTS_DIRECTORY}/reassure-tests.sh`);

    if (!(await existsSync('dangerfile.js')) && !(await existsSync('dangerfile.ts'))) {
      log('Copying the dangerfile.js template file');
      await copyFileSync(`${__dirname}/../templates/dangerfile.js`, './dangerfile.js');
    } else {
      warn('Dangerfile already present, copying as dangerfile.reassure.js.');
      warn('Please compare your dangerfile configuration with our template');
      await copyFileSync(`${__dirname}/../templates/dangerfile.js`, './dangerfile.reassure.js');
    }

    log('Checking if .gitignore file exists');

    if (!(await existsSync('.gitignore'))) {
      warn("File { .gitignore } doesn't exists => skipping");
    } else {
      const currentGitIgnore = await readFileSync('.gitignore');

      if (currentGitIgnore.includes('.reassure')) {
        warn('File { .gitignore } already up-to-date => skipping');
      } else {
        log('Appeding .gitignore file with: ', GITIGNORE_DATA);
        await appendFileSync('.gitignore', GITIGNORE_DATA);
      }
    }

    printLog('verbose', 'Finished initalizing new reassure testing environment.');
    printLog('verbose', 'Please refer to our CI guide in order to set up your pipelines.');
    printLog('verbose', 'Find more @ https://github.com/callstack/reassure#ci-integration');
    printBye();
  } catch (err) {
    error('Reassure initialization script failed, please refer to the error message : ', err as any);
  }
}

export const command: CommandModule<{}, InitOptions> = {
  command: ['init', '$0'],
  describe: 'Initializes basic reassure setup, thus allowing for further configuration of your CI pipeline.',
  builder: (yargs) => {
    return yargs.option('logLevel', {
      string: true,
      default: 'default',
      choices: ['verbose', 'silent', 'default'],
      describe:
        'Types of logs which will be printed to console - verbose: all logs | default: warnings and errors | silent: no logs',
    });
  },
  handler: (args) => run(args),
};