import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import minimist from 'minimist';

import type { PerfResultEntry } from '../measure/types';
import type {
  StatisticSignificance,
  ComparisonAddedResult,
  ComparisonRemovedResult,
  ComparisonRegularResult,
  ComparisonOutput,
} from './types';
import { printToConsole } from './outputConsole';
import { writeToJson } from './outputJson';
import { writeToMarkdown } from './outputMarkdown';

type ScriptArguments = {
  baselineFilePath: string;
  currentFilePath: string;
  outputFilePath: string;
  output?: 'console' | 'json' | 'markdown' | 'all';
};

type LoadFileResult = { [key: string]: PerfResultEntry };

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
 * Constants below are tightly related to the `computeZ(baseline_avg: number,
 * baseline_sigma: number, mean: number, n: number): number` function and
 * SHOULD NOT be changed without the full understanding of their significance.
 *
 * For more information refer to https://github.com/v8/v8/blob/master/test/benchmarks/csuite/compare-baseline.py
 */
const PROBABILITY_CONSIDERED_SIGNIFICANT = 0.02;
const PROBABILITY_CONSIDERED_MEANINGLESS = 0.05;
const DURATION_DIFF_THRESHOLD_SIGNIFICANT = 4;
const DURATION_DIFF_THRESHOLD_MININGLESS = 2;

/**
 * Main executor function of the compare tool. Responsible for aggregating data generated
 * from comparison of the current.txt and baseline.txt diff and returning that data in
 * easily digestible format
 */
export const main = async () => {
  try {
    const hasCurrentFile = fsSync.existsSync(currentFilePath);
    if (!hasCurrentFile) {
      console.warn(`Current results files "${currentFilePath}" does not exists. Check your setup.`);
      process.exit(1);
    }

    const current = await loadFile(currentFilePath);

    const hasBaslineFile = fsSync.existsSync(baselineFilePath);
    if (!hasBaslineFile) {
      console.warn(
        `Baseline results files "${baselineFilePath}" does not exists. This warning should be ignored only if you are bootstapping perf test setup, otherwise it indicates invalid setup.`
      );
    }

    const baseline = hasBaslineFile ? await loadFile(baselineFilePath) : null;

    const outputData = compareResults(current, baseline);

    if (output === 'console' || output === 'all') printToConsole(outputData);
    if (output === 'json' || output === 'all') writeToJson(outputFilePath, outputData);
    if (output === 'markdown' || output === 'all') writeToMarkdown('compare-output.md', outputData);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Responsible for loading a measurer output file, parsing and returning its data
 */
const loadFile = async (path: string): Promise<LoadFileResult> => {
  const data = await fs.readFile(path, 'utf8');

  const lines = data.split(/\r?\n/);
  const entries: PerfResultEntry[] = lines.filter((line) => !!line.trim()).map((line) => JSON.parse(line));

  const names = entries.map((entry) => entry.name);

  if (hasDuplicatedEntryNames(names)) {
    throw new Error(
      `Your test output files include records with duplicated names.
      Please remove any non-unique names from your test suites and try again
      `
    );
  }

  const result: LoadFileResult = {};

  for (const item of entries) {
    result[item.name] = item;
  }

  return result;
};

/**
 * Responsible for comparing results from baseline and current data sets
 */
const compareResults = (currentEntries: LoadFileResult, baselineEntries: LoadFileResult | null): ComparisonOutput => {
  const keys = [...new Set([...Object.keys(currentEntries), ...Object.keys(baselineEntries || {})])];

  const regular: ComparisonRegularResult[] = [];
  const added: ComparisonAddedResult[] = [];
  const removed: ComparisonRemovedResult[] = [];

  keys.forEach((name) => {
    const current = currentEntries[name];
    const baseline = baselineEntries?.[name];

    if (baseline && current) {
      regular.push(generateCompareResult(name, current, baseline));
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
  };
};

/**
 * Generates statistics from all tests based on current-perf-results.txt and baseline-perf-results.txt file entries
 */
const generateCompareResult = (
  name: string,
  current: PerfResultEntry,
  baseline: PerfResultEntry
): ComparisonRegularResult => {
  const durationDiff = current.meanDuration - baseline.meanDuration;
  const durationDiffPercent = (durationDiff / baseline.meanDuration) * 100;
  const countDiff = current.meanCount - baseline.meanCount;
  const countDiffPercent = (countDiff / baseline.meanCount) * 100;

  const z = computeZ(baseline.meanDuration, baseline.stdevDuration, current.meanDuration, current.runs);

  const prob = computeProbability(z);

  let durationDiffSignificance: StatisticSignificance = 'INSIGNIFICANT';
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
};

/**
 * Utility functions used for computing statistical probabilities of certain types of
 * results durationDiffStatuses occurring based on fed data allowing for better avoidance of
 * measurement errors nad outliers
 *
 * Based on :: https://github.com/v8/v8/blob/master/test/benchmarks/csuite/compare-baseline.py
 */
function computeZ(baseline_avg: number, baseline_sigma: number, mean: number, n: number) {
  if (baseline_sigma == 0) return 1000;
  return Math.abs((mean - baseline_avg) / (baseline_sigma / Math.sqrt(n)));
}
function computeProbability(z: number) {
  if (z > 2.575_829)
    // p 0.005: two sided < 0.01
    return 0;
  if (z > 2.326_348)
    // p 0.010
    return 0.01;
  if (z > 2.170_091)
    // p 0.015
    return 0.02;
  if (z > 2.053_749)
    // p 0.020
    return 0.03;
  if (z > 1.959_964)
    // p 0.025: two sided < 0.05
    return 0.04;
  if (z > 1.880_793)
    // p 0.030
    return 0.05;
  if (z > 1.811_91)
    // p 0.035
    return 0.06;
  if (z > 1.750_686)
    // p 0.040
    return 0.07;
  if (z > 1.695_397)
    // p 0.045
    return 0.08;
  if (z > 1.644_853)
    // p 0.050: two sided < 0.10
    return 0.09;
  if (z > 1.281_551)
    // p 0.100: two sided < 0.20
    return 0.1;
  return 0.2; // two sided p >= 0.20
}

/**
 * Utility function returning true if input array of strings consists of any non-unique members
 */
const hasDuplicatedEntryNames = (arr: string[]) => arr.length !== new Set(arr).size;

/**
 * Utility function responsible for writing output data into a specified JSON file
 */

/**
 * Main script function call
 */
main();
