import * as fs from 'fs/promises';
import * as path from 'path';
import minimist from 'minimist';

import {
  Entry,
  Stats,
  StatsAdded,
  StatsFull,
  StatsRemoved,
  AnalyserOutput,
  isStatsAdded,
  isStatsCountChanged,
  isStatsInsignificant,
  isStatsMeaningless,
  isStatsRemoved,
  isStatsSignificant,
  DurationStatStatusType,
} from './shared';
import {
  formatCount,
  formatCountChange,
  formatDuration,
  formatPercentChange,
} from './utils';

type ScriptArguments = {
  baselineFilePath: string;
  currentFilePath: string;
  outputFilePath: string;
  output?: 'console' | 'json' | 'all';
};

type LoadFileResult = { [key: string]: Entry };

/**
 * List of arguments which can be passed to the node command running the script as --<ARGUMENT>=<VALUE>
 * e.g. --baselineFilePath="./myOutputFile.txt"
 */
const {
  output,
  currentFilePath = 'current.txt',
  baselineFilePath = 'baseline.txt',
  outputFilePath = 'analyser-output.json',
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

/**
 * Main executor function of the analyser tool. Responsible for aggregating data generated
 * from comparison of the current.txt and baseline.txt diff and returning that data in
 * easily digestible format
 */
export const main = async () => {
  try {
    const current = await loadFile(currentFilePath);
    const baseline = await loadFile(baselineFilePath);
    const outputData = analyse(current, baseline);

    if (output === 'console' || output === 'all') printStats(outputData);
    if (output === 'json' || output === 'all') writeToJson(outputData);
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
  const entries: Entry[] = lines
    .filter((line) => !!line.trim())
    .map((line) => JSON.parse(line));

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
const analyse = (current: LoadFileResult, baseline: LoadFileResult) => {
  const keys = [
    ...new Set([...Object.keys(baseline), ...Object.keys(current)]),
  ];

  return keys
    .map((key) => generateLineStats(key, baseline?.[key], current?.[key]))
    .filter(Boolean);
};

/**
 * Generates statistics from all tests based on current.txt and baseline.txt file entries
 */
const generateLineStats = (
  name: string,
  baseline?: Entry,
  current?: Entry
): Stats => {
  if (!baseline) {
    return { name, current, durationDiffStatus: undefined } as StatsAdded;
  } else if (!current) {
    return { name, baseline, durationDiffStatus: undefined } as StatsRemoved;
  }

  const durationDiff = current.meanDuration - baseline.meanDuration;
  const durationDiffPercent = (durationDiff / baseline.meanDuration) * 100;
  const countDiff = current.meanCount - baseline.meanCount;
  const countDiffPercent = (countDiff / baseline.meanCount) * 100;

  const z = computeZ(
    baseline.meanDuration,
    baseline.stdevDuration,
    current.meanDuration,
    current.runs
  );
  const prob = computeProbability(z);

  let durationDiffStatus: DurationStatStatusType = 'INSIGNIFICANT';
  if (prob < PROBABILITY_CONSIDERED_SIGNIFICANT && Math.abs(durationDiff) > 3)
    durationDiffStatus = 'SIGNIFICANT';
  if (prob > PROBABILITY_CONSIDERED_MEANINGLESS || Math.abs(durationDiff) < 1)
    durationDiffStatus = 'MEANINGLESS';

  return {
    name,
    durationDiffStatus,
    baseline,
    current,
    durationDiff,
    durationDiffPercent,
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
function computeZ(
  baseline_avg: number,
  baseline_sigma: number,
  mean: number,
  n: number
) {
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
 * Generates main output data object for any of the outputting functions
 */
const generateOutput = (stats: Stats[]): AnalyserOutput => {
  const added = stats.filter(isStatsAdded);
  const removed = stats.filter(isStatsRemoved);
  const significant = stats.filter(isStatsSignificant);
  const meaningless = stats.filter(isStatsMeaningless);
  const insignificant = stats.filter(isStatsInsignificant);
  const countChanged = stats.filter(isStatsCountChanged);

  return {
    significant: significant.sort((a, b) => b.durationDiff - a.durationDiff),
    insignificant: insignificant.sort(
      (a, b) => b.durationDiff - a.durationDiff
    ),
    meaningless: meaningless.sort((a, b) => b.durationDiff - a.durationDiff),
    countChanged: countChanged.sort((a, b) => b.countDiff - a.countDiff),
    added: added.sort(
      (a, b) => b.current.meanDuration - a.current.meanDuration
    ),
    removed: removed.sort(
      (a, b) => b.baseline.meanDuration - a.baseline.meanDuration
    ),
  };
};

/**
 * Utility function returning true if input array of strings consists of any non-unique members
 */
const hasDuplicatedEntryNames = (arr: string[]) =>
  arr.length !== new Set(arr).size;

/**
 * Utility functions used for printing analysed results
 */
function printLine(item: StatsFull) {
  console.log(
    `|  - ${item.name}: ${formatPercentChange(
      item.durationDiffPercent
    )} (${formatDuration(item.baseline.meanDuration)} => ${formatDuration(
      item.current.meanDuration
    )}) | ${formatCountChange(item.countDiff)} (${formatCount(
      item.baseline.meanCount
    )} => ${formatCount(item.current.meanCount)})`
  );
}
function printAdded(item: StatsAdded) {
  console.log(
    `|  - ${item.name}: ${formatDuration(
      item.current.meanDuration
    )} | ${formatCount(item.current.meanCount)}`
  );
}
function printRemoved(item: StatsRemoved) {
  console.log(
    `|  - ${item.name}: ${formatDuration(
      item.baseline.meanDuration
    )} | ${formatCount(item.baseline.meanCount)}`
  );
}
function printStats(stats: Stats[]) {
  const output = generateOutput(stats);

  console.log('\n| ----- Analyser.js output > console -----');

  for (const key of Object.keys(output)) {
    const _key = key as keyof typeof output;

    console.log(`| ${_key.toUpperCase()} changes:`);

    if (_key === 'added') {
      output[_key].forEach(printAdded);
    } else if (_key === 'removed') {
      output[_key].forEach(printRemoved);
    } else {
      output[_key].forEach(printLine);
    }
  }

  console.log('| ----------------------------------------\n');
}
/**
 * Utility function responsible for writing output data into a specified JSON file
 */
async function writeToJson(stats: Stats[]) {
  console.log('\n| ----- Analyser.js output > json -----');
  try {
    await fs.writeFile(
      outputFilePath,
      JSON.stringify({ data: generateOutput(stats) })
    );

    console.log(`| ✅  Written output file ${outputFilePath}`);
    console.log(`| 🔗 ${path.resolve(outputFilePath)}`);
  } catch (error) {
    console.log(`| ❌  Could not write file ${outputFilePath}`);
    console.log(`| 🔗 ${path.resolve(outputFilePath)}`);
    console.error(error);
  }

  console.log('| -------------------------------------\n');
}

/**
 * Main script function call
 */
main();
