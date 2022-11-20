import { mkdirSync, rmSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { spawnSync } from 'child_process';
import type { CommandModule } from 'yargs';
import { compare, formatMetadata } from '@callstack/reassure-compare';
import type { PerformanceMetadata } from '@callstack/reassure-compare/lib/typescript/types';
import { getGitBranch, getGitCommitHash } from './git';

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

  console.log(`\n❇️  Running performance tests:`);
  console.log(` - ${measurementType}: ${formatMetadata(metadata)}\n`);

  mkdirSync(RESULTS_DIRECTORY, { recursive: true });

  const outputFile = options.baseline ? BASELINE_FILE : RESULTS_FILE;
  rmSync(outputFile, { force: true });

  const header = { metadata };
  writeFileSync(outputFile, JSON.stringify(header) + '\n');

  const testRunnerPath =
    process.env.TEST_RUNNER_PATH ?? process.platform === 'win32'
      ? 'node_modules/jest/bin/jest'
      : 'node_modules/.bin/jest';

  const testRunnerArgs = process.env.TEST_RUNNER_ARGS ?? '--runInBand --testMatch "<rootDir>/**/*.perf-test.[jt]s?(x)"';

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

  console.log('');

  if (spawnInfo.status !== 0) {
    console.error(`❌  Test runner (${testRunnerPath}) exited with error code ${spawnInfo.status}`);
    process.exitCode = 1;
    return;
  }

  if (existsSync(outputFile)) {
    console.log(`✅  Written ${measurementType} performance measurements to ${outputFile}`);
    console.log(`🔗 ${resolve(outputFile)}\n`);
  } else {
    console.error(`❌  Something went wrong, ${measurementType} performance file (${outputFile}) does not exist\n`);
    return;
  }

  if (options.baseline) {
    console.log("Hint: You can now run 'reassure' to measure & compare performance against modified code.\n");
    return;
  }

  if (options.compare) {
    if (existsSync(BASELINE_FILE)) {
      compare();
    } else {
      console.log(
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
