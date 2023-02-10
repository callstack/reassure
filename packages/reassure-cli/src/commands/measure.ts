import { mkdirSync, rmSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { spawnSync } from 'child_process';
import type { CommandModule } from 'yargs';
import { compare, formatMetadata } from '@callstack/reassure-compare';
import type { PerformanceMetadata } from '@callstack/reassure-compare/lib/typescript/types';
import { getGitBranch, getGitCommitHash } from '../utils/git';
import { logger } from '../utils/logger';

const RESULTS_DIRECTORY = '.reassure';
const RESULTS_FILE = '.reassure/current.perf';
const BASELINE_FILE = '.reassure/baseline.perf';

type MeasureOptions = {
  baseline?: boolean;
  compare?: boolean;
  branch?: string;
  commitHash?: string;
};

export async function run(options: MeasureOptions) {
  const measurementType = options.baseline ? 'Baseline' : 'Current';

  const metadata: PerformanceMetadata = {
    branch: options?.branch ?? (await getGitBranch()),
    commitHash: options?.commitHash ?? (await getGitCommitHash()),
  };

  logger.log('');
  logger.log(`❇️  Running performance tests:`);
  logger.log(` - ${measurementType}: ${formatMetadata(metadata)}\n`);

  mkdirSync(RESULTS_DIRECTORY, { recursive: true });

  const outputFile = options.baseline ? BASELINE_FILE : RESULTS_FILE;
  rmSync(outputFile, { force: true });

  const header = { metadata };
  writeFileSync(outputFile, JSON.stringify(header) + '\n');

  const defaultPath = process.platform === 'win32' ? 'node_modules/jest/bin/jest' : 'node_modules/.bin/jest';
  const testRunnerPath = process.env.TEST_RUNNER_PATH ?? defaultPath;

  const defaultArgs = '--runInBand --testMatch "<rootDir>/**/*.perf-test.[jt]s?(x)"';
  const testRunnerArgs = process.env.TEST_RUNNER_ARGS ?? defaultArgs;

  const spawnInfo = spawnSync(
    'node',
    [
      '--jitless',
      '--expose-gc',
      '--no-concurrent-sweeping',
      '--max-old-space-size=4096',
      testRunnerPath,
      testRunnerArgs,
    ],
    { shell: true, stdio: 'inherit', env: { ...process.env, OUTPUT_FILE: outputFile } }
  );

  logger.log('');

  if (spawnInfo.status !== 0) {
    console.error(`❌  Test runner (${testRunnerPath}) exited with error code ${spawnInfo.status}`);
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
      compare();
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
  describe: 'Gather performance measurements by running performance tests',
  builder: (yargs) => {
    return yargs
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
      });
  },
  handler: (args) => run(args),
};
