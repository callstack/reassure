import * as fs from 'fs/promises';
import * as fsSync from 'fs';

import { hasDuplicateValues } from './utils/array';
import type {
  PerformanceEntry,
  StatisticalSignificance,
  AddedEntry,
  RemovedEntry,
  CompareEntry,
  CompareResult,
} from './types';
import { printToConsole } from './output/console';
import { writeToJson } from './output/json';
import { writeToMarkdown } from './output/markdown';
import { errors, warnings, logError, logWarning } from './utils/logs';

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

/**
 * Threshold for considering render count change as significant. This implies inclusion
 * of scenario results in Render Count Changed output section.
 */
const COUNT_DIFF_THRESHOLD = 0.5;

/**
 * Record type holding `PerformanceEntry` objects keyed by entry name.
 */
type PerformanceRecord = { [name: string]: PerformanceEntry };

type CompareOptions = {
  baselineFile?: string;
  currentFile?: string;
  outputFile?: string;
  outputFormat?: string;
};

/**
 * Main routine.
 *
 * Responsible for loading baseline and current performance results and outputting data in various formats.
 */
export async function compare({
  baselineFile = '.reassure/baseline.perf',
  currentFile = '.reassure/current.perf',
  outputFile = '.reassure/output.json',
  outputFormat = 'all',
}: CompareOptions) {
  const hasCurrentFile = fsSync.existsSync(currentFile);
  if (!hasCurrentFile) {
    logError(`Current results files "${currentFile}" does not exists. Check your setup.`);
    process.exit(1);
  }

  const current = await loadFile(currentFile);

  const hasBaslineFile = fsSync.existsSync(baselineFile);
  if (!hasBaslineFile) {
    logWarning(
      `Baseline results files "${baselineFile}" does not exists. This warning should be ignored only if you are bootstapping perf test setup, otherwise it indicates invalid setup.`
    );
  }

  const baseline = hasBaslineFile ? await loadFile(baselineFile) : null;

  const outputData = compareResults(current, baseline);

  if (outputFormat === 'console' || outputFormat === 'all') printToConsole(outputData);
  if (outputFormat === 'json' || outputFormat === 'all') writeToJson(outputFile, outputData);
  if (outputFormat === 'markdown' || outputFormat === 'all') writeToMarkdown('.reassure/output.md', outputData);
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
  // Unique test scenario names
  const names = [...new Set([...Object.keys(currentEntries), ...Object.keys(baselineEntries || {})])];

  const compared: CompareEntry[] = [];
  const added: AddedEntry[] = [];
  const removed: RemovedEntry[] = [];

  names.forEach((name) => {
    const current = currentEntries[name];
    const baseline = baselineEntries?.[name];

    if (baseline && current) {
      compared.push(buildCompareEntry(name, current, baseline));
    } else if (current) {
      added.push({ name, current });
    } else if (baseline) {
      removed.push({ name, baseline });
    }
  });

  const significant = compared
    .filter((item) => item.durationDiffSignificance === 'SIGNIFICANT')
    .sort((a, b) => b.durationDiff - a.durationDiff);
  const insignificant = compared
    .filter((item) => item.durationDiffSignificance === 'INSIGNIFICANT')
    .sort((a, b) => b.durationDiff - a.durationDiff);
  const meaningless = compared
    .filter((item) => item.durationDiffSignificance === 'MEANINGLESS')
    .sort((a, b) => b.durationDiff - a.durationDiff);
  const countChanged = compared
    .filter((item) => item.countDiff > COUNT_DIFF_THRESHOLD)
    .sort((a, b) => b.countDiff - a.countDiff);
  added.sort((a, b) => b.current.meanDuration - a.current.meanDuration);
  removed.sort((a, b) => b.baseline.meanDuration - a.baseline.meanDuration);

  return {
    errors,
    warnings,
    significant,
    insignificant,
    meaningless,
    countChanged,
    added,
    removed,
  };
}

/**
 * Establish statisticial signficance of render duration difference build compare entry.
 */
function buildCompareEntry(name: string, current: PerformanceEntry, baseline: PerformanceEntry): CompareEntry {
  const durationDiff = current.meanDuration - baseline.meanDuration;
  const relativeDurationDiff = durationDiff / baseline.meanDuration;
  const countDiff = current.meanCount - baseline.meanCount;
  const relativeCountDiff = countDiff / baseline.meanCount;

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
    relativeDurationDiff,
    durationDiffSignificance,
    countDiff,
    relativeCountDiff,
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
