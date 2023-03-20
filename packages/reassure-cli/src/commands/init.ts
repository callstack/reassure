import { mkdirSync, copyFileSync, existsSync, readFileSync, appendFileSync } from 'fs';
import { logger } from '@callstack/reassure-logger';

import type { CommandModule } from 'yargs';

import { RESULTS_DIRECTORY } from '../constants';
import { applyCommonOptions, CommonOptions } from '../options';
import { bye, ciSetupHint, configureLoggerOptions, hello } from '../utils/logger';

interface InitOptions extends CommonOptions {
  javascript?: boolean;
}
/**
 * @param options options which come from the CLI command when ran
 *
 * Main runner function for the init command for reassure-cli. It will create the .reassure directory
 * and copy the test shell script template over there. It will additionally copy over the dangerfile
 * template to the root folder and update .gitignore file if present and not already containing mentions
 * of reassure within it.
 */
export function run(options: InitOptions): void {
  configureLoggerOptions(options);

  hello(options);
  logger.log('Checking if reassure setup exists');

  if (existsSync(RESULTS_DIRECTORY)) {
    logger.error('Reassure has already been initialized => exiting');

    return;
  }

  logger.log('Creating the results directory');
  mkdirSync(RESULTS_DIRECTORY);

  logger.log('Copying the reassure-tests.sh template file');
  copyFileSync(`${__dirname}/../templates/reassure-tests`, `./reassure-tests.sh`);

  const extension = options.javascript ? 'js' : 'ts';

  if (!existsSync(`dangerfile.${extension}`)) {
    logger.log(`Copying the dangerfile.${extension} template file`);
    copyFileSync(`${__dirname}/../templates/dangerfile`, `./dangerfile.${extension}`);
  } else {
    logger.warn(`Dangerfile already present, copying as dangerfile.reassure.${extension}.`);
    logger.warn('Please compare your dangerfile configuration with our template');
    copyFileSync(`${__dirname}/../templates/dangerfile`, `./dangerfile.reassure.${extension}`);
  }

  logger.log('Checking if .gitignore file exists');

  if (!existsSync('.gitignore')) {
    logger.warn("File { .gitignore } doesn't exists => skipping");
  } else {
    const currentGitIgnore = readFileSync('.gitignore');

    if (currentGitIgnore.includes('.reassure')) {
      logger.warn('File { .gitignore } already up-to-date => skipping');
    } else {
      const gitIgnoreTemplate = readFileSync(`${__dirname}/../templates/gitignore`);
      logger.log('Appeding .gitignore file with: ', JSON.stringify(gitIgnoreTemplate));
      appendFileSync('.gitignore', gitIgnoreTemplate);
    }
  }

  ciSetupHint(options);
  bye(options);
}

export const command: CommandModule<{}, InitOptions> = {
  command: ['init', '$0'],
  describe: 'Initializes basic reassure setup, thus allowing for further configuration of your CI pipeline.',
  builder: (yargs) => {
    return applyCommonOptions(yargs).option('javascript', {
      type: 'boolean',
      default: false,
      describe: 'Optional argument allowing to switch to JS templating instead of the default - TS',
    });
  },
  handler: (args) => run(args),
};
