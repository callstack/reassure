import { mkdirSync, rmSync, existsSync } from 'fs';
import { resolve } from 'path';
import { spawnSync } from 'child_process';
import type { CommandModule } from 'yargs';
import { compare } from '@reassure/reassure-compare';

const RESULTS_DIRECTORY = '.reassure';
const RESULTS_FILE = '.reassure/current.perf';
const BASELINE_FILE = '.reassure/baseline.perf';

type MeasureOptions = {
  baseline?: boolean;
  compare?: boolean;
};

export function run(options: MeasureOptions) {
  const measurementType = options.baseline ? 'baseline' : 'current';
  console.log(`\n❇️  Running ${measurementType} performance tests:`);

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

  console.log('');

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
      });
  },
  handler: (args) => run(args),
};
