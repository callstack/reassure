import { mkdirSync, rmSync } from 'fs';
import { spawnSync } from 'child_process';
import type { CommandModule } from 'yargs';

const RESULTS_DIRECTORY = '.reassure';
const RESULTS_FILE = '.reassure/current.perf';
const BASELINE_FILE = '.reassure/baseline.perf';

type MeasureOptions = {
  baseline: boolean;
};

export function run(options: MeasureOptions) {
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
}

export const command: CommandModule<{}, MeasureOptions> = {
  command: 'measure',
  describe: 'Measures the current performance of performance tests',
  builder: (yargs) => {
    return yargs.option('baseline', {
      type: 'boolean',
      default: false,
      describe: 'Save measurements as baseline instead of current',
    });
  },
  handler: (args) => run(args),
};
