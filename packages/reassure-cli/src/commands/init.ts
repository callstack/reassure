import { copyFileSync, existsSync, readFileSync, appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { logger } from '@callstack/reassure-logger';
import type { CommandModule } from 'yargs';
import {
  CI_SCRIPT,
  DANGERFILE_FALLBACK_JS,
  DANGERFILE_FALLBACK_TS,
  DANGERFILE_JS,
  DANGERFILE_TS,
  GIT_IGNORE,
} from '../constants';
import { applyCommonOptions, CommonOptions } from '../options';
import { ASCII_BYE, ASCII_HELLO } from '../utils/ascii';
import { configureLoggerOptions } from '../utils/logger';

const TEMPLATE_PATH = `${__dirname}/../templates`;

/**
 * Generate requred Reassure files.
 */
export function run(options: CommonOptions): void {
  configureLoggerOptions(options);

  logger.colorLog('brand', ASCII_HELLO);

  setUpCiScript();
  setUpDangerFile();
  setUpGitIgnore();

  logger.log('');
  logger.colorLog('brand', 'Finished initalizing new Reassure testing environment.');
  logger.log('Please refer to our CI guide in order to set up your pipelines.');
  logger.log('🔗 https://callstack.github.io/reassure/docs/installation#ci-setup');

  logger.colorLog('brand', ASCII_BYE);
}

export const command: CommandModule<{}, CommonOptions> = {
  command: ['init', '$0'],
  describe: 'Initializes basic reassure setup, thus allowing for further configuration of your CI pipeline.',
  builder: (yargs) => {
    return applyCommonOptions(yargs);
  },
  handler: (args) => run(args),
};

function setUpCiScript() {
  logger.log('');
  logger.logProgress('#️⃣  CI Script:');

  if (existsSync(CI_SCRIPT)) {
    logger.clearLine();
    logger.log(`✅  CI Script: skipping - already exists`);
    logger.log(`🔗 ${resolve(CI_SCRIPT)}`);
    return;
  }

  copyFileSync(`${TEMPLATE_PATH}/reassure-tests`, CI_SCRIPT);
  logger.clearLine();
  logger.log(`✅  CI Script: created`);
  logger.log(`🔗 ${resolve(CI_SCRIPT)}`);
}

function setUpDangerFile() {
  const [existingFile, fallbackFile] = queryDangerfile();

  logger.log('');
  logger.logProgress('#️⃣  Dangerfile:');

  if (!existingFile) {
    // If users does not have existing dangerfile, let use the JS one, as potentially less prolematic.
    copyFileSync(`${TEMPLATE_PATH}/dangerfile`, DANGERFILE_JS);
    logger.clearLine();
    logger.log(`✅  Dangerfile: created`);
    logger.log(`🔗 ${resolve(DANGERFILE_JS)}`);
    return;
  }

  const existingContent = readFileSync(existingFile);
  if (existingContent.includes('reassure')) {
    logger.clearLine();
    logger.log(`✅  Dangerfile: skipping - already contains Reassure code`);
    logger.log(`🔗 ${resolve(existingFile)}`);
    return;
  }

  logger.clearLine();
  logger.log(`⚠️   Dangerfile: created ${fallbackFile} - merge with existing ${existingFile}`);
  logger.log(`🔗 ${resolve(fallbackFile)}`);
}

function queryDangerfile(): [string, string] | [null, null] {
  if (existsSync(DANGERFILE_TS)) {
    return [DANGERFILE_TS, DANGERFILE_FALLBACK_TS];
  }

  if (existsSync(DANGERFILE_JS)) {
    return [DANGERFILE_JS, DANGERFILE_FALLBACK_JS];
  }

  return [null, null];
}

function setUpGitIgnore() {
  logger.log('');
  logger.logProgress('#️⃣  .gitignore:');

  if (!existsSync(GIT_IGNORE)) {
    copyFileSync(`${TEMPLATE_PATH}/gitignore`, GIT_IGNORE);
    logger.clearLine();
    logger.log('✅  .gitignore: created');
    logger.log(`🔗 ${resolve(GIT_IGNORE)}`);
    return;
  }

  const existingContent = readFileSync(GIT_IGNORE);
  if (existingContent.includes('.reassure')) {
    logger.clearLine();
    logger.log(`✅  .gitignore: skipping - already contains '.reassure' entry.`);
    logger.log(`🔗 ${resolve(GIT_IGNORE)}`);
    return;
  }

  const gitIgnoreTemplate = readFileSync(`${TEMPLATE_PATH}/gitignore`);
  appendFileSync('.gitignore', gitIgnoreTemplate);
  logger.clearLine();
  logger.log(`✅  .gitignore: added '.reassure' entry.`);
  logger.log(`🔗 ${resolve(GIT_IGNORE)}`);
}
