import * as fs from 'fs/promises';
import * as path from 'path';
import minimist from 'minimist';

import type { MeasureRenderStats } from './measure';

type ScriptArguments = {
  baselineFilePath: string;
  currentFilePath: string;
  outputFilePath: string;
  output?: 'console' | 'json' | 'all';
};

/**
 * Defines output of one specific test
 */
type Entry = {
  /* name parameter passed down to measureRender function */
  name: string;
} & MeasureRenderStats;

/**
 * Serialised result from entries found in files consumed by the script
 */
type LoadFileResult = { [key: string]: Entry };

/**
 * Type of the performance measure change as compared to the baseline.txt file
 */
type StatStatusType = 'NON-SIGNIFICANT' | 'SIGNIFICANT' | 'MEANINGLESS';

/**
 * Base Stats object as returned by test which were either added or removed, therefore
 * offering no comparison data to return
 */
type StatsBase = {
  name: string;
  status: StatStatusType | undefined;
};

/**
 * Base Stats object as returned by test which were either added or removed, therefore
 * offering no comparison data to return
 */
type StatsAdded = StatsBase & {
  current: Entry;
};

/**
 * Base Stats object as returned by test which were either added or removed, therefore
 * offering no comparison data to return
 */
type StatsRemoved = StatsBase & {
  baseline: Entry;
};

/**
 * Full Stats object as returned by test which was able to compare data between
 * a baseline.txt file Entry and its counterpart in the current.txt file
 */
type StatsFull = StatsAdded &
  StatsRemoved & {
    durationDiff: number;
    durationDiffPercent: number;
    countDiff: number;
    countDiffPercent: number;
  };

/**
 * Shorthand for either of the Stats types
 */
type Stats = StatsRemoved | StatsAdded | StatsFull;

/**
 * Indexer type for `printStats(input: PrintStatsInput):void` function
 */
type PrintStatsInput = { [key: string]: Stats[] };

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
 * Responsible for loading a measurer output file, parsing and return its data
 * as LoadFileResult or Error in case the supplied file cannot be read from destination
 * @param path
 */
const loadFile = async (path: string): Promise<LoadFileResult | Error> => {
  try {
    const data = await fs.readFile(path, 'utf8');
    const lines = data.split(/\r?\n/);
    const entries: Entry[] = lines
      .filter((line) => !!line.trim())
      .map((line) => JSON.parse(line));

    const result: LoadFileResult = {};
    for (const item of entries) {
      result[item.name] = item;
    }
    return result;
  } catch (error: any) {
    const _error = new Error(error);

    // Add log level options in future e.g. --error --warn --verbose
    console.error(`Error loading file from: ${path}`, _error);

    return _error;
  }
};

/**
 * Main executor function of the analyser tool. Responsible for aggregating data generated
 * from comparison of the current.txt and baseline.txt diff and returning that data in
 * easily digestible format
 */
export const analyse = async (): Promise<Stats[]> => {
  const current = await loadFile(currentFilePath);
  const baseline = await loadFile(baselineFilePath);
  let _current: LoadFileResult | undefined;
  let _baseline: LoadFileResult | undefined;

  const isStats = (data: any): data is Stats =>
    typeof data.current !== undefined || typeof data.baseline !== undefined;

  if (isStats(baseline)) _baseline = baseline as LoadFileResult;
  if (isStats(current)) _current = current as LoadFileResult;

  const keys = [
    ...new Set([...Object.keys(baseline), ...Object.keys(current)]),
  ];
  const stats = keys
    .map((key) => generateLineStats(key, _baseline?.[key], _current?.[key]))
    .filter(Boolean);

  if (output === 'console' || output === 'all') printStats(stats);
  if (output === 'json' || output === 'all') writeToJson(stats);

  return stats;
};

/**
 * Generates statistics from all tests based on current.txt and baseline.txt file entries
 * @param name
 * @param baseline
 * @param current
 */
const generateLineStats = (
  name: string,
  baseline?: Entry,
  current?: Entry
): Stats => {
  if (!baseline) {
    return { name, current, status: undefined } as StatsAdded;
  } else if (!current) {
    return { name, baseline, status: undefined } as StatsRemoved;
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

  let status: StatStatusType = 'NON-SIGNIFICANT';
  if (prob < PROBABILITY_CONSIDERED_SIGNIFICANT && Math.abs(durationDiff) > 3)
    status = 'SIGNIFICANT';
  if (prob > PROBABILITY_CONSIDERED_MEANINGLESS || Math.abs(durationDiff) < 1)
    status = 'MEANINGLESS';

  return {
    name,
    status,
    baseline,
    current,
    durationDiff,
    durationDiffPercent,
    countDiff,
    countDiffPercent,
  };
};

analyse();

/**
 * Utility functions used for computing statistical probabilities of certain types of
 * results statuses occurring based on fed data allowing for better avoidance of
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
 * Utility functions used for formatting data into strings
 */
function formatPercentChange(value: number): string {
  if (value >= 0.05) return `+${value.toFixed(1)}%`;
  if (value <= -0.05) return `${value.toFixed(1)}%`;
  return `±${value.toFixed(1)}`;
}
function formatDuration(duration: number): string {
  if (duration < 10) {
    return `${duration.toFixed(1)} ms`;
  }
  return `${duration.toFixed(1)} ms`;
}
function formatCount(value: number) {
  return value;
}
function formatCountChange(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return `±${value}`;
}

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
  const significant = stats.filter(
    (item) => item.status === 'SIGNIFICANT'
  ) as StatsFull[];
  const nonSignificant = stats.filter(
    (item) => item.status === 'NON-SIGNIFICANT'
  ) as StatsFull[];
  const meaningless = stats.filter(
    (item) => item.status === 'MEANINGLESS'
  ) as StatsFull[];
  const countChanges = stats.filter(
    (item) => (item as StatsFull).countDiff
  ) as StatsFull[];
  const added = stats.filter(
    (item) => !(item as StatsFull).baseline
  ) as StatsAdded[];
  const removed = stats.filter(
    (item) => !(item as StatsFull).current
  ) as StatsRemoved[];

  const input: PrintStatsInput = {
    significant: significant.sort((a, b) => b.durationDiff - a.durationDiff),
    nonSignificant: nonSignificant.sort(
      (a, b) => b.durationDiff - a.durationDiff
    ),
    meaningless: meaningless.sort((a, b) => b.durationDiff - a.durationDiff),
    countChanges: countChanges.sort((a, b) => b.countDiff - a.countDiff),
    added: added.sort(
      (a, b) => b.current.meanDuration - a.current.meanDuration
    ),
    removed: removed.sort(
      (a, b) => b.baseline.meanDuration - a.baseline.meanDuration
    ),
  };

  console.log('\n| ----- Analyser.js output > console -----');

  for (const key of Object.keys(input)) {
    const _key = key;

    console.log(`| ${_key.toUpperCase()} changes:`);

    if (_key === 'added') {
      (input[_key] as StatsAdded[]).forEach(printAdded);
    } else if (_key === 'removed') {
      (input[_key] as StatsRemoved[]).forEach(printRemoved);
    } else {
      (input[_key] as StatsFull[]).forEach(printLine);
    }
  }

  console.log('| ----------------------------------------\n');
}

async function writeToJson(stats: Stats[]) {
  console.log('\n| ----- Analyser.js output > json -----');

  try {
    await fs.writeFile(outputFilePath, JSON.stringify({ statistics: stats }));

    console.log(`| ✅  Written output file ${outputFilePath}`);
    console.log(`| 🔗 ${path.resolve(outputFilePath)}`);
  } catch (error) {
    console.log(`| ❌  Could not write file ${outputFilePath}`);
    console.log(`| 🔗 ${path.resolve(outputFilePath)}`);
    console.error(error);
  }

  console.log('| -------------------------------------\n');
}
