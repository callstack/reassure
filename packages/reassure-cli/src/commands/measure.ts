import * as fs from 'fs';
import { spawnSync } from 'child_process';
import type { Argv } from 'yargs';

const RESULTS_DIRECTORY = '.reassure';
const RESULTS_FILE = '.reassure/current.perf';
const BASELINE_FILE = '.reassure/baseline.perf';

export const command = 'measure';
export const describe = 'runs performance tests to gather measurements';

export function builder(yargs: Argv) {
  return yargs.options({
    baseline: { type: 'boolean', default: false, describe: 'Save measurements as baseline instead of current' },
  });
}

type MeasureArguments = {
  baseline: boolean;
};

export function handler(args: MeasureArguments) {
  fs.mkdirSync(RESULTS_DIRECTORY, { recursive: true });

  const outputFile = args.baseline ? BASELINE_FILE : RESULTS_FILE;
  fs.rmSync(outputFile, { force: true });

  spawnSync(
    'node',
    [
      '--jitless',
      '--expose-gc',
      '--no-concurrent-sweeping',
      '--max-old-space-size=4096',
      'node_modules/.bin/jest',
      '--runInBand',
      '--testMatch "<rootDir>/**/*.perf-test.[jt]s?(x)"',
    ],
    { shell: true, stdio: 'inherit', env: { ...process.env, OUTPUT_FILE: outputFile } }
  );
}
