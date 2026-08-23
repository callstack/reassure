import { copyFileSync, existsSync, readFileSync, appendFileSync } from 'node:fs';
import * as path from 'node:path';
import * as logger from '@callstack/reassure-logger';
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

const TEMPLATE_PATH = path.join(__dirname, '..', 'templates');

/**
 * Generate requred Reassure files.
 */
export function run(options: CommonOptions): void {
  configureLoggerOptions(options);

  logger.color('brand', ASCII_HELLO);

  setUpCiScript();
  setUpDangerFile();
  setUpGitIgnore();

  logger.log('');
  logger.color('brand', 'Finished initalizing new Reassure testing environment.');
  logger.log('Please refer to our CI guide in order to set up your pipelines.');
  logger.log('🔗 https://callstack.github.io/reassure/docs/installation#ci-setup');

  logger.color('brand', ASCII_BYE);
}

export const command: CommandModule<{}, CommonOptions> = {
  command: ['init'],
  describe: 'Automates basic Reassure setup steps.',
  builder: (yargs) => {
    return applyCommonOptions(yargs);
  },
  handler: (args) => run(args),
};

function setUpCiScript() {
  logger.log('');
  logger.progress('#️⃣  CI Script:');

  if (existsSync(CI_SCRIPT)) {
    logger.clearLine();
    logger.log(`✅  CI Script: skipping - already exists`);
    logger.log(`🔗 ${path.resolve(CI_SCRIPT)}`);
    return;
  }

  const template = usesBun() ? 'reassure-tests-bun' : 'reassure-tests';
  copyFileSync(path.join(TEMPLATE_PATH, template), CI_SCRIPT);
  logger.clearLine();
  logger.log(`✅  CI Script: created`);
  logger.log(`🔗 ${path.resolve(CI_SCRIPT)}`);
}

function usesBun(): boolean {
  if (existsSync('package.json')) {
    try {
      const packageManager = JSON.parse(readFileSync('package.json', 'utf8')).packageManager;

      if (typeof packageManager === 'string') {
        return packageManager === 'bun' || packageManager.startsWith('bun@');
      }
    } catch {
      // Fall back to lockfile detection for malformed package manifests.
    }
  }

  return existsSync('bun.lock') || existsSync('bun.lockb');
}

function setUpDangerFile() {
  const [existingFile, fallbackFile] = queryDangerfile();

  logger.log('');
  logger.progress('#️⃣  Dangerfile:');

  if (!existingFile) {
    // If users does not have existing dangerfile, let use the JS one, as potentially less prolematic.
    copyFileSync(path.join(TEMPLATE_PATH, 'dangerfile'), DANGERFILE_JS);
    logger.clearLine();
    logger.log(`✅  Dangerfile: created`);
    logger.log(`🔗 ${path.resolve(DANGERFILE_JS)}`);
    return;
  }

  const existingContent = readFileSync(existingFile);
  if (existingContent.includes('reassure')) {
    logger.clearLine();
    logger.log(`✅  Dangerfile: skipping - already contains Reassure code`);
    logger.log(`🔗 ${path.resolve(existingFile)}`);
    return;
  }

  logger.clearLine();
  logger.log(`⚠️   Dangerfile: created ${fallbackFile} - merge with existing ${existingFile}`);
  logger.log(`🔗 ${path.resolve(fallbackFile)}`);
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
  logger.progress('#️⃣  .gitignore:');

  if (!existsSync(GIT_IGNORE)) {
    copyFileSync(path.join(TEMPLATE_PATH, 'gitignore'), GIT_IGNORE);
    logger.clearLine();
    logger.log('✅  .gitignore: created');
    logger.log(`🔗 ${path.resolve(GIT_IGNORE)}`);
    return;
  }

  const existingContent = readFileSync(GIT_IGNORE);
  if (existingContent.includes('.reassure')) {
    logger.clearLine();
    logger.log(`✅  .gitignore: skipping - already contains '.reassure' entry.`);
    logger.log(`🔗 ${path.resolve(GIT_IGNORE)}`);
    return;
  }

  const gitIgnoreTemplate = readFileSync(`${TEMPLATE_PATH}/gitignore`);
  appendFileSync('.gitignore', gitIgnoreTemplate);
  logger.clearLine();
  logger.log(`✅  .gitignore: added '.reassure' entry.`);
  logger.log(`🔗 ${path.resolve(GIT_IGNORE)}`);
}
