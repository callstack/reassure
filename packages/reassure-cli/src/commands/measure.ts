import * as fs from 'fs';
import { spawnSync } from 'child_process';

const RESULTS_DIRECTORY = '.reassure';
const RESULTS_FILE = '.reassure/current.perf';

export const command = 'measure';
export const describe = 'runs performance tests to gather measurements';

export function handler() {
  fs.mkdirSync(RESULTS_DIRECTORY, { recursive: true });
  fs.rmSync(RESULTS_FILE, { force: true });

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
    { shell: true, stdio: 'inherit' }
  );
}
