import { mkdirSync, copyFileSync, existsSync, readFileSync, appendFileSync } from 'fs';
import type { CommandModule } from 'yargs';
import { logger } from '../utils/logger';
import type { DefaultOptions } from '../types';

import { RESULTS_DIRECTORY } from '../constants';

type InitOptions = {
  javascript?: boolean;
} & DefaultOptions;
/**
 * @param options options which come from the CLI command when ran
 *
 * Main runner function for the init command for reassure-cli. It will create the .reassure directory
 * and copy the test shell script template over there. It will additionally copy over the dangerfile
 * template to the root folder and update .gitignore file if present and not already containing mentions
 * of reassure within it.
 */
export async function run(options: InitOptions): Promise<void> {
  logger.configure(options);
  logger.hello();
  logger.log('Checking if reassure setup exists');
  if (await existsSync(RESULTS_DIRECTORY)) {
    logger.error('Reassure has already been initialized => exiting');
    return;
  }

  try {
    logger.log('Creating the results directory');
    await mkdirSync(RESULTS_DIRECTORY);

    logger.log('Copying the reassure-tests.sh template file');
    await copyFileSync(`${__dirname}/../templates/reassure-tests`, `./reassure-tests.sh`);

    const extension = options.javascript ? 'js' : 'ts';

    if (!(await existsSync(`dangerfile.${extension}`))) {
      logger.log(`Copying the dangerfile.${extension} template file`);
      await copyFileSync(`${__dirname}/../templates/dangerfile`, `./dangerfile.${extension}`);
    } else {
      logger.warn(`Dangerfile already present, copying as dangerfile.reassure.${extension}.`);
      logger.warn('Please compare your dangerfile configuration with our template');
      await copyFileSync(`${__dirname}/../templates/dangerfile`, `./dangerfile.reassure.${extension}`);
    }

    logger.log('Checking if .gitignore file exists');

    if (!(await existsSync('.gitignore'))) {
      logger.warn("File { .gitignore } doesn't exists => skipping");
    } else {
      const currentGitIgnore = await readFileSync('.gitignore');

      if (currentGitIgnore.includes('.reassure')) {
        logger.warn('File { .gitignore } already up-to-date => skipping');
      } else {
        const gitIgnoreTemplate = await readFileSync(`${__dirname}/../templates/gitignore`);
        logger.log('Appeding .gitignore file with: ', JSON.stringify(gitIgnoreTemplate));
        await appendFileSync('.gitignore', gitIgnoreTemplate);
      }
    }

    logger.ciSetupHint();
    logger.bye();
  } catch (err) {
    logger.error('Reassure initialization script failed, please refer to the error message : ', err as any);
  }
}

export const command: CommandModule<{}, InitOptions> = {
  command: ['init', '$0'],
  describe: 'Initializes basic reassure setup, thus allowing for further configuration of your CI pipeline.',
  builder: (yargs) => {
    return yargs.options({
      silent: {
        type: 'boolean',
        default: false,
        describe: 'removes all logs from the process besides errors',
      },
      verbose: {
        type: 'boolean',
        default: false,
        describe: 'keeps all logs from the process',
      },
      'no-ascii-art': {
        type: 'boolean',
        default: false,
        describe: 'keeps logs but removes the ascii art from them',
      },
      javascript: {
        type: 'boolean',
        default: false,
        describe: 'Optional argument allowing to switch to JS templating instead of the default - TS',
      },
    });
  },
  handler: (args) => run(args),
};
