import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import type { CommandModule } from 'yargs';
import { compare, formatMetadata } from '@callstack/reassure-compare';
import type { MeasureMetadata } from '@callstack/reassure-compare';
import * as logger from '@callstack/reassure-logger';
import { RESULTS_DIRECTORY, RESULTS_FILE, BASELINE_FILE } from '../constants';
import { applyCommonOptions, CommonOptions } from '../options';
import { getGitBranch, getGitCommitHash } from '../utils/git';
import { configureLoggerOptions } from '../utils/logger';
import { getJestBinPath, getNodeFlags, getNodeMajorVersion } from '../utils/node';

// Jest default testMatch: [ "**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)" ]
const DEFAULT_TEST_MATCH = ['**/__perf__/**/*.[jt]s?(x)', '**/*.(perf|perf-test).[jt]s?(x)'];

export interface MeasureOptions extends CommonOptions {
  baseline?: boolean;
  compare?: boolean;
  branch?: string;
  commitHash?: string;
  testMatch?: string[];
  testRegex?: string[];
  /** Rest argument used for flags after `--` separator, will be passed to test runner. */
  _?: string[];
}

export async function run(options: MeasureOptions) {
  configureLoggerOptions(options);

  const measurementType = options.baseline ? 'Baseline' : 'Current';

  const metadata: MeasureMetadata = {
    creationDate: new Date().toISOString(),
    branch: options?.branch ?? (await getGitBranch()),
    commitHash: options?.commitHash ?? (await getGitCommitHash()),
  };

  logger.log(`\n❇️  Running performance tests:`);
  logger.log(` - ${measurementType}: ${formatMetadata(metadata)}\n`);

  mkdirSync(RESULTS_DIRECTORY, { recursive: true });

  const outputFile = options.baseline ? BASELINE_FILE : RESULTS_FILE;
  rmSync(outputFile, { force: true });

  const header = { metadata };
  writeFileSync(outputFile, JSON.stringify(header) + '\n');

  const testRunnerPath = process.env.TEST_RUNNER_PATH ?? getJestBinPath();
  if (!testRunnerPath) {
    logger.error(
      `❌ Unable to find Jest binary path. Pass explicit $TEST_RUNNER_PATH env variable to resolve the issue.`
    );
    process.exitCode = 1;
    return;
  }

  const baseTestRunnerArgs = process.env.TEST_RUNNER_ARGS ?? buildDefaultTestRunnerArgs(options);
  const passthroughArgs = options._ ?? [];

  const nodeMajorVersion = getNodeMajorVersion();
  logger.verbose(`Node.js version: ${nodeMajorVersion} (${process.versions.node})`);

  const nodeArgs = [...getNodeFlags(nodeMajorVersion), testRunnerPath, baseTestRunnerArgs, ...passthroughArgs];
  logger.verbose('Running tests using command:');
  logger.verbose(`$ node \\\n    ${nodeArgs.join(' \\\n    ')}\n`);

  const spawnInfo = spawnSync('node', nodeArgs, {
    shell: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      REASSURE_OUTPUT_FILE: outputFile,
      REASSURE_SILENT: options.silent.toString(),
      REASSURE_VERBOSE: options.verbose.toString(),
    },
  });

  logger.newLine();

  if (spawnInfo.status !== 0) {
    logger.error(`❌  Test runner (${testRunnerPath}) exited with error code ${spawnInfo.status}`);
    process.exitCode = 1;
    return;
  }

  if (existsSync(outputFile)) {
    logger.log(`✅  Written ${measurementType} performance measurements to ${outputFile}`);
    logger.log(`🔗 ${resolve(outputFile)}\n`);
  } else {
    logger.error(`❌  Something went wrong, ${measurementType} performance file (${outputFile}) does not exist\n`);
    return;
  }

  if (options.baseline) {
    logger.log("Hint: You can now run 'reassure' to measure & compare performance against modified code.\n");
    return;
  }

  if (options.compare) {
    if (existsSync(BASELINE_FILE)) {
      await compare();
    } else {
      logger.log(
        `Baseline performance file does not exist, run 'reassure --baseline' on your baseline code branch to create it.\n`
      );
      return;
    }
  }
}

export const command: CommandModule<{}, MeasureOptions> = {
  command: ['measure', '$0'],
  describe: '[Default] Gather performance measurements by running performance tests.',
  builder: (yargs) => {
    return applyCommonOptions(yargs)
      .option('baseline', {
        type: 'boolean',
        default: false,
        describe: 'Save measurements as baseline instead of current',
      })
      .option('compare', {
        type: 'boolean',
        default: true,
        describe: 'Outputs performance comparison results',
      })
      .option('branch', {
        type: 'string',
        describe: 'Branch name of current code to be included in the report',
      })
      .option('commit-hash', {
        type: 'string',
        describe: 'Commit hash of current code to be included in the report',
      })
      .option('testMatch', {
        type: 'string',
        array: true,
        describe: 'The glob patterns Reassure uses to detect perf test files',
      })
      .option('testRegex', {
        type: 'string',
        array: true,
        describe: 'The regexp patterns Reassure uses to detect perf test files',
      });
  },
  handler: (args) => run(args),
};

function buildDefaultTestRunnerArgs(options: MeasureOptions) {
  if (options.testMatch && options.testRegex) {
    logger.error('Configuration options "testMatch" and "testRegex" cannot be used together.');
    process.exit(1);
  }

  const commonArgs = '--runInBand';

  if (options.testMatch) {
    return `${commonArgs} --testMatch=${toShellArray(options.testMatch)}`;
  }

  if (options.testRegex) {
    return `${commonArgs} --testRegex=${toShellArray(options.testRegex)}`;
  }

  return `${commonArgs} --testMatch=${toShellArray(DEFAULT_TEST_MATCH)}`;
}

function toShellArray(texts: string[]): string {
  return texts
    .map(shellEscape)
    .map((text) => `"${text}"`)
    .join(' ');
}

function shellEscape(text: string) {
  return text.replace(/(["'$`\\])/g, '\\$1');
}
