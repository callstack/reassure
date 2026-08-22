import { join } from 'node:path';

export const RESULTS_DIRECTORY = process.env.REASSURE_OUTPUT_DIR ?? '.reassure';
export const RESULTS_FILE = join(RESULTS_DIRECTORY, 'current.perf');
export const BASELINE_FILE = join(RESULTS_DIRECTORY, 'baseline.perf');

export const CI_SCRIPT = 'reassure-tests.sh';

export const DANGERFILE_JS = 'dangerfile.js';
export const DANGERFILE_TS = 'dangerfile.ts';
export const DANGERFILE_FALLBACK_JS = 'dangerfile-reassure.js';
export const DANGERFILE_FALLBACK_TS = 'dangerfile-reassure.ts';

export const GIT_IGNORE = '.gitignore';
