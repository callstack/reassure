import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import minimist from 'minimist';

import type { PerformanceEntry } from '../measure/types';
import { hasDuplicateValues } from '../utils/array';
import type { StatisticalSignificance, AddedEntry, RemovedEntry, CompareEntry, CompareResult } from './types';
import { printToConsole } from './outputConsole';
import { writeToJson } from './outputJson';
import { writeToMarkdown } from './outputMarkdown';

type ScriptArguments = {
  baselineFilePath: string;
  currentFilePath: string;
  outputFilePath: string;
  output?: 'console' | 'json' | 'markdown' | 'all';
};

/**
 * Record type holding `PerformanceEntry` objects keyed by entry name.
 */
type PerformanceRecord = { [name: string]: PerformanceEntry };

/**
 * List of arguments which can be passed to the node command running the script as --<ARGUMENT>=<VALUE>
 * e.g. --baselineFilePath="./myOutputFile.txt"
 */
const {
  output,
  currentFilePath = 'perf-results.txt',
  baselineFilePath = 'baseline-results.txt',
  outputFilePath = 'compare-output.json',
} = minimist<ScriptArguments>(process.argv);

/**
 * Probability threshold for considering given difference signficiant.
 */
const PROBABILITY_CONSIDERED_SIGNIFICANT = 0.02;

/**
 * Probability threshold for considering given difference meaningless.
 */
const PROBABILITY_CONSIDERED_MEANINGLESS = 0.05;

/**
 * Render duration threshold (in ms) for treating given difference as significant.
 *
 * This is additional filter, in addition to probability threshold above.
 * Too small duration difference might be result of measurement grain of 1 ms.
 */
const DURATION_DIFF_THRESHOLD_SIGNIFICANT = 4;

/**
 * Render duration threshold (in ms) for treating given difference as meaningless.
 *
 * This is an overriding filter that can override probability threshold above.
 * Too small duration difference might be result of measurement grain of 1 ms.
 */
const DURATION_DIFF_THRESHOLD_MININGLESS = 2;

const errors: string[] = [];
const warnings: string[] = [];

function logError(message: string, ...args: any[]) {
  errors.push(message);
  console.error(`🛑 ${message}`, ...args);
}

function logWarning(message: string) {
  warnings.push(message);
  console.warn(`🟡 ${message}`);
}

/**
 * Main routine.
 *
 * Responsible for loading baseline and current performance results and outputting data in various formats.
 */
export async function main() {
  logError('Test error');
  logWarning('Test warning');

  try {
    const hasCurrentFile = fsSync.existsSync(currentFilePath);
    if (!hasCurrentFile) {
      logError(`Current results files "${currentFilePath}" does not exists. Check your setup.`);
      process.exit(1);
    }

    const current = await loadFile(currentFilePath);

    const hasBaslineFile = fsSync.existsSync(baselineFilePath);
    if (!hasBaslineFile) {
      logWarning(
        `Baseline results files "${baselineFilePath}" does not exists. This warning should be ignored only if you are bootstapping perf test setup, otherwise it indicates invalid setup.`
      );
    }

    const baseline = hasBaslineFile ? await loadFile(baselineFilePath) : null;

    const outputData = compareResults(current, baseline);

    if (output === 'console' || output === 'all') printToConsole(outputData);
    if (output === 'json' || output === 'all') writeToJson(outputFilePath, outputData);
    if (output === 'markdown' || output === 'all') writeToMarkdown('compare-output.md', outputData);
  } catch (error) {
    logError(`Error.`, error);
    process.exit(1);
  }
}

/**
 * Load performance file and parse it to `PerformanceRecord` object.
 */
async function loadFile(path: string): Promise<PerformanceRecord> {
  const data = await fs.readFile(path, 'utf8');

  const lines = data.split(/\r?\n/);
  // TODO: add data format validation
  const entries: PerformanceEntry[] = lines.filter((line) => !!line.trim()).map((line) => JSON.parse(line));

  if (hasDuplicateValues(entries.map((entry) => entry.name))) {
    const msg = `Your performance result file ${path} contains records with duplicated names.
      Please remove any non-unique names from your test suites and try again.
      `;
    logError(msg);
    throw new Error(msg);
  }

  const result: PerformanceRecord = {};
  entries.forEach((entry) => {
    result[entry.name] = entry;
  });

  return result;
}

/**
 * Compare results between baseline and current entries and categorize.
 */
function compareResults(currentEntries: PerformanceRecord, baselineEntries: PerformanceRecord | null): CompareResult {
  // unique keys
  const names = [...new Set([...Object.keys(currentEntries), ...Object.keys(baselineEntries || {})])];

  const regular: CompareEntry[] = [];
  const added: AddedEntry[] = [];
  const removed: RemovedEntry[] = [];

  names.forEach((name) => {
    const current = currentEntries[name];
    const baseline = baselineEntries?.[name];

    if (baseline && current) {
      regular.push(buildCompareEntry(name, current, baseline));
    } else if (current) {
      added.push({ name, current });
    } else if (baseline) {
      removed.push({ name, baseline });
    }
  });

  const significant = regular
    .filter((item) => item.durationDiffSignificance === 'SIGNIFICANT')
    .sort((a, b) => b.durationDiff - a.durationDiff);
  const insignificant = regular
    .filter((item) => item.durationDiffSignificance === 'INSIGNIFICANT')
    .sort((a, b) => b.durationDiff - a.durationDiff);
  const meaningless = regular
    .filter((item) => item.durationDiffSignificance === 'MEANINGLESS')
    .sort((a, b) => b.durationDiff - a.durationDiff);
  const countChanged = regular.filter((item) => item.countDiff !== 0).sort((a, b) => b.countDiff - a.countDiff);
  added.sort((a, b) => b.current.meanDuration - a.current.meanDuration);
  removed.sort((a, b) => b.baseline.meanDuration - a.baseline.meanDuration);

  return {
    significant,
    insignificant,
    meaningless,
    countChanged,
    added,
    removed,
    errors,
    warnings,
  };
}

/**
 * Establish statisticial signficance of render duration difference build compare entry.
 */
function buildCompareEntry(name: string, current: PerformanceEntry, baseline: PerformanceEntry): CompareEntry {
  const durationDiff = current.meanDuration - baseline.meanDuration;
  const durationDiffPercent = (durationDiff / baseline.meanDuration) * 100;
  const countDiff = current.meanCount - baseline.meanCount;
  const countDiffPercent = (countDiff / baseline.meanCount) * 100;

  const z = computeZ(baseline.meanDuration, baseline.stdevDuration, current.meanDuration, current.runs);
  const prob = computeProbability(z);

  let durationDiffSignificance: StatisticalSignificance = 'INSIGNIFICANT';
  if (prob < PROBABILITY_CONSIDERED_SIGNIFICANT && Math.abs(durationDiff) >= DURATION_DIFF_THRESHOLD_SIGNIFICANT)
    durationDiffSignificance = 'SIGNIFICANT';

  if (prob > PROBABILITY_CONSIDERED_MEANINGLESS || Math.abs(durationDiff) <= DURATION_DIFF_THRESHOLD_MININGLESS)
    durationDiffSignificance = 'MEANINGLESS';

  return {
    name,
    baseline,
    current,
    durationDiff,
    durationDiffPercent,
    durationDiffSignificance,
    countDiff,
    countDiffPercent,
  };
}

/**
 * Calculate z-score for given baseline and current performance results.
 *
 * Based on :: https://github.com/v8/v8/blob/master/test/benchmarks/csuite/compare-baseline.py
 */
function computeZ(baselineMean: number, baselineStdev: number, currentMean: number, runs: number) {
  if (baselineStdev == 0) return 1000;

  return Math.abs((currentMean - baselineMean) / (baselineStdev / Math.sqrt(runs)));
}

/**
 * Compute statisticial hyphotesis probability based on z-score.
 *
 * Based on :: https://github.com/v8/v8/blob/master/test/benchmarks/csuite/compare-baseline.py
 */
function computeProbability(z: number) {
  // p 0.005: two sided < 0.01
  if (z > 2.575_829) return 0;

  // p 0.010
  if (z > 2.326_348) return 0.01;

  // p 0.015
  if (z > 2.170_091) return 0.02;

  // p 0.020
  if (z > 2.053_749) return 0.03;

  // p 0.025: two sided < 0.05
  if (z > 1.959_964) return 0.04;

  // p 0.030
  if (z > 1.880_793) return 0.05;

  // p 0.035
  if (z > 1.811_91) return 0.06;

  // p 0.040
  if (z > 1.750_686) return 0.07;

  // p 0.045
  if (z > 1.695_397) return 0.08;

  // p 0.050: two sided < 0.10
  if (z > 1.644_853) return 0.09;

  // p 0.100: two sided < 0.20
  if (z > 1.281_551) return 0.1;

  // two sided p >= 0.20
  return 0.2;
}

main();
