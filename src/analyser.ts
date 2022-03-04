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
type StatStatusType = 'INSIGNIFICANT' | 'SIGNIFICANT' | 'MEANINGLESS';

/**
 * Base properties of Stats object shared between all subtypes
 */
type StatsBase = {
  name: string;
  durationDiffStatus: StatStatusType | undefined;
};

/**
 * Stats object for an added test, that does not exist in baseline.txt file
 */
type StatsAdded = StatsBase & {
  current: Entry;
};

/**
 * Stats object for a removed test, that does not exist in current.txt file
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
 * Shorthands for different Stats objects depending on their `durationDiffStatus`
 */
type StatsSignificant = StatsFull & {
  durationDiffStatus: 'SIGNIFICANT';
};
type StatsInsignificant = StatsFull & {
  durationDiffStatus: 'INSIGNIFICANT';
};
type StatsMeaningless = StatsFull & {
  durationDiffStatus: 'MEANINGLESS';
};

/**
 * Shorthand for either of the Stats object types
 */
type Stats =
  | StatsRemoved
  | StatsAdded
  | StatsSignificant
  | StatsInsignificant
  | StatsMeaningless;

/**
 * Output data structure to be consumed by any of the outputting functions
 */
type Output = { [key: string]: Stats[] };

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

  let durationDiffStatus: StatStatusType = 'INSIGNIFICANT';
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
const generateOutput = (stats: Stats[]): Output => {
  const added = stats.filter(isStatsAdded);
  const removed = stats.filter(isStatsRemoved);
  const significant = stats.filter(isStatsSignificant);
  const meaningless = stats.filter(isStatsMeaningless);
  const insignificant = stats.filter(isStatsInsignificant);
  const countChanged = stats.filter(isStatsCountChanged);

  return {
    significant: sortByKey<StatsSignificant>(significant, 'durationDiff'),
    insignificant: sortByKey<StatsInsignificant>(insignificant, 'durationDiff'),
    meaningless: sortByKey<StatsMeaningless>(meaningless, 'durationDiff'),
    countChanged: sortByKey<StatsFull>(countChanged, 'countDiff'),
    added: sortByKey<StatsAdded>(added, 'current.meanDuration'),
    removed: sortByKey<StatsRemoved>(removed, 'baseline.meanDuration'),
  };
};

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
  return '±0';
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
  const output = generateOutput(stats);

  console.log('\n| ----- Analyser.js output > console -----');

  for (const key of Object.keys(output)) {
    const _key = key;

    console.log(`| ${_key.toUpperCase()} changes:`);

    if (_key === 'added') {
      (output[_key] as StatsAdded[]).forEach(printAdded);
    } else if (_key === 'removed') {
      (output[_key] as StatsRemoved[]).forEach(printRemoved);
    } else {
      (output[_key] as StatsFull[]).forEach(printLine);
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
 * Utility function allowing to sort an array by proving it
 * as well as the path of a parameter to sort with
 * --------
 * @param data
 * Generically typed array of objects to be sorted by the function
 * @param path
 * Provided path should either be a string if it's one level deep,
 * or a chain of string separated by dot mark, e.g.
 * `keyLevelOne.keyLevelTwo.keyLevelThree`
 */
const sortByKey = <T extends { [key: string]: any }>(
  data: T[],
  path: string
): T[] =>
  data.sort((a, b) => {
    let _a: any = a[path];
    let _b: any = b[path];

    if (path.includes('.')) {
      const subKeys = path.split('.');

      for (const subKey in subKeys) {
        _a = _a[subKey];
        _b = _b[subKey];
      }
    }

    if (!_a || !_b) return -1;
    if (typeof _a !== 'number' || typeof _b !== 'number') return -1;

    return _b - _a;
  });

/**
 * Type guard functions
 */
const isStatsSignificant = (data: any): data is StatsSignificant =>
  data?.durationDiffStatus === 'SIGNIFICANT';
const isStatsInsignificant = (data: any): data is StatsInsignificant =>
  data?.durationDiffStatus === 'INSIGNIFICANT';
const isStatsMeaningless = (data: any): data is StatsMeaningless =>
  data?.durationDiffStatus === 'MEANINGLESS';
const isStatsCountChanged = (data: any): data is StatsFull =>
  typeof data?.countDiff === 'number' && data?.countDiff !== 0;
const isStatsAdded = (data: any): data is StatsAdded =>
  !data?.baseline && typeof data?.current !== undefined;
const isStatsRemoved = (data: any): data is StatsRemoved =>
  !data?.current && typeof data?.baseline !== undefined;

/**
 * Main script function call
 */
analyse();
