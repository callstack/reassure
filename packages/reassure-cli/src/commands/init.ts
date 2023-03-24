import { copyFileSync, existsSync, readFileSync, appendFileSync } from 'fs';
import { resolve } from 'path';
import { logger } from '@callstack/reassure-logger';
import type { CommandModule } from 'yargs';
import { applyCommonOptions, CommonOptions } from '../options';
import { ASCII_BYE, ASCII_HELLO } from '../utils/ascii';
import { configureLoggerOptions } from '../utils/logger';

const TEMPLATE_PATH = `${__dirname}/../templates`;
const PATH_GIT_IGNORE = './.gitignore';
const PATH_REASSURE_SCRIPT = './reassure-tests.sh';

interface InitOptions extends CommonOptions {
  javascript?: boolean;
}
/**
 * @param options options which come from the CLI command when ran
 *
 * Main runner function for the init command for reassure-cli. It will create the .reassure directory
 * and copy the test shell script template over there. It will additionally copy over the dangerfile
 * template to the root folder and update .gitignore file if present and not already containing mentions
 * of Reassure within it.
 */
export function run(options: InitOptions): void {
  configureLoggerOptions(options);

  logger.colorLog('brand', ASCII_HELLO);

  setUpCiScript();
  setUpDangerFile(options);
  setUpGitIgnore();

  logger.log('');
  logger.colorLog('brand', 'Finished initalizing new Reassure testing environment.');
  logger.log('Please refer to our CI guide in order to set up your pipelines.');
  logger.log('🔗 https://callstack.github.io/reassure/docs/installation#ci-setup');

  logger.colorLog('brand', ASCII_BYE);
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

function setUpCiScript() {
  logger.log('');
  logger.logProgress('#️⃣  CI Script:');

  if (existsSync(PATH_REASSURE_SCRIPT)) {
    logger.clearLine();
    logger.log(`✅  CI Script: skipping - already exists`);
    logger.log(`🔗 ${resolve(PATH_REASSURE_SCRIPT)}`);
    return;
  }

  copyFileSync(`${TEMPLATE_PATH}/reassure-tests`, PATH_REASSURE_SCRIPT);
  logger.clearLine();
  logger.log(`✅  CI Script: created`);
  logger.log(`🔗 ${resolve(PATH_REASSURE_SCRIPT)}`);
}

function setUpDangerFile({ javascript }: InitOptions) {
  const extension = javascript ? 'js' : 'ts';
  const dangerfileName = `dangerfile.${extension}`;
  const dangerfileFallback = `dangerfile.reassure.${extension}`;
  const pathToDangerfile = `./${dangerfileName}`;

  logger.log('');
  logger.logProgress('#️⃣  Dangerfile:');

  if (!existsSync(pathToDangerfile)) {
    copyFileSync(`${TEMPLATE_PATH}/dangerfile`, pathToDangerfile);
    logger.clearLine();
    logger.log(`✅  Dangerfile: created`);
    logger.log(`🔗 ${resolve(dangerfileName)}`);
    return;
  }

  const currentContent = readFileSync(pathToDangerfile);
  if (currentContent.includes('reassure')) {
    logger.clearLine();
    logger.log(`✅  Dangerfile: skipping - already contains Reassure code`);
    logger.log(`🔗 ${resolve(dangerfileName)}`);
    return;
  }

  logger.clearLine();
  logger.log(`⚠️   Dangerfile: created ${dangerfileFallback} - merge with existing ${dangerfileName}`);
  logger.log(`🔗 ${resolve(dangerfileFallback)}`);
}

function setUpGitIgnore() {
  logger.log('');
  logger.logProgress('#️⃣  .gitignore:');

  if (!existsSync(PATH_GIT_IGNORE)) {
    copyFileSync(`${TEMPLATE_PATH}/gitignore`, PATH_GIT_IGNORE);
    logger.clearLine();
    logger.log('✅  .gitignore: created');
    logger.log(`🔗 ${resolve(PATH_GIT_IGNORE)}`);
    return;
  }

  const currentGitIgnore = readFileSync(PATH_GIT_IGNORE);
  if (currentGitIgnore.includes('.reassure')) {
    logger.clearLine();
    logger.log(`✅  .gitignore: skipping - already contains '.reassure' entry.`);
    logger.log(`🔗 ${resolve(PATH_GIT_IGNORE)}`);
    return;
  }

  const gitIgnoreTemplate = readFileSync(`${TEMPLATE_PATH}/gitignore`);
  appendFileSync('.gitignore', gitIgnoreTemplate);
  logger.clearLine();
  logger.log(`✅  .gitignore: added '.reassure' entry.`);
  logger.log(`🔗 ${resolve(PATH_GIT_IGNORE)}`);
}
