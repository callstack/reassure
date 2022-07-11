import { mkdirSync, rmSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import type { CommandModule } from 'yargs';
import { run as runCompare } from './compare';

const RESULTS_DIRECTORY = '.reassure';
const RESULTS_FILE = '.reassure/current.perf';
const BASELINE_FILE = '.reassure/baseline.perf';

type MeasureOptions = {
  baseline: boolean;
};

export function run(options: MeasureOptions) {
  console.log('\n❇️  Running performance tests:');

  mkdirSync(RESULTS_DIRECTORY, { recursive: true });

  const outputFile = options.baseline ? BASELINE_FILE : RESULTS_FILE;
  rmSync(outputFile, { force: true });

  spawnSync(
    'node',
    [
      '--jitless',
      '--expose-gc',
      '--no-concurrent-sweeping',
      '--max-old-space-size=4096',
      process.env.TEST_RUNNER_PATH ?? 'node_modules/.bin/jest',
      process.env.TEST_RUNNER_ARGS ?? '--runInBand --testMatch "<rootDir>/**/*.perf-test.[jt]s?(x)"',
    ],
    { shell: true, stdio: 'inherit', env: { ...process.env, OUTPUT_FILE: outputFile } }
  );

  if (!options.baseline && existsSync(BASELINE_FILE) && existsSync(RESULTS_FILE)) {
    runCompare();
  }
}

export const command: CommandModule<{}, MeasureOptions> = {
  command: 'measure',
  describe: 'Gather performance measurements by running performance tests',
  builder: (yargs) => {
    return yargs.option('baseline', {
      type: 'boolean',
      default: false,
      describe: 'Save measurements as baseline instead of current',
    });
  },
  handler: (args) => run(args),
};
