import { appendFileSync, copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
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

const PACKAGE_MANAGER_COMMANDS = {
  npm: {
    install: 'npm install',
    reassure: 'npm exec -- reassure',
  },
  yarn: {
    install: 'yarn install',
    reassure: 'yarn reassure',
  },
  bun: {
    install: 'bun install',
    reassure: 'bun run reassure',
  },
} as const;

type SupportedPackageManager = keyof typeof PACKAGE_MANAGER_COMMANDS;

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

  const packageManager = detectPackageManager();
  const commands = PACKAGE_MANAGER_COMMANDS[packageManager];
  const template = readFileSync(path.join(TEMPLATE_PATH, 'reassure-tests'), 'utf8');
  const script = template
    .split('{{INSTALL_COMMAND}}')
    .join(commands.install)
    .split('{{REASSURE_COMMAND}}')
    .join(commands.reassure);

  writeFileSync(CI_SCRIPT, script, { mode: 0o755 });
  logger.clearLine();
  logger.log(`✅  CI Script: created`);
  logger.log(`🔗 ${path.resolve(CI_SCRIPT)}`);
}

function detectPackageManager(): SupportedPackageManager {
  if (existsSync('package.json')) {
    try {
      const packageManager = JSON.parse(readFileSync('package.json', 'utf8')).packageManager;

      if (typeof packageManager === 'string') {
        if (packageManager === 'npm' || packageManager.startsWith('npm@')) {
          return 'npm';
        }
        if (packageManager === 'yarn' || packageManager.startsWith('yarn@')) {
          return 'yarn';
        }
        if (packageManager === 'bun' || packageManager.startsWith('bun@')) {
          return 'bun';
        }
      }
    } catch {
      // Fall back to lockfile detection for malformed package manifests.
    }
  }

  if (existsSync('bun.lock') || existsSync('bun.lockb')) {
    return 'bun';
  }
  if (existsSync('yarn.lock')) {
    return 'yarn';
  }
  if (existsSync('package-lock.json') || existsSync('npm-shrinkwrap.json')) {
    return 'npm';
  }

  return 'yarn';
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
