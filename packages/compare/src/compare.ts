import * as fsSync from 'fs';

import type {
  AddedEntry,
  RemovedEntry,
  CompareEntry,
  CompareResult,
  MeasureResults,
  MeasureEntry,
  MeasureHeader,
} from './types';
import { printToConsole } from './output/console';
import { writeToJson } from './output/json';
import { writeToMarkdown } from './output/markdown';
import { errors, warnings, logError, logWarning } from './utils/logs';
import { parseHeader, parseMeasureEntries } from './utils/validate';

/**
 * Probability threshold for considering given difference significant.
 */
const PROBABILITY_CONSIDERED_SIGNIFICANT = 0.02;

/**
 * Duration threshold (in ms) for treating given difference as significant.
 *
 * This is additional filter, in addition to probability threshold above.
 * Too small duration difference might be result of measurement grain of 1 ms.
 */
const DURATION_DIFF_THRESHOLD_SIGNIFICANT = 4;

/**
 * Threshold for considering render or execution count change as significant. This implies inclusion
 * of scenario results in Count Changed output section.
 */
const COUNT_DIFF_THRESHOLD = 0.5;

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
}: CompareOptions = {}) {
  const hasCurrentFile = fsSync.existsSync(currentFile);
  if (!hasCurrentFile) {
    logError(`Current results files "${currentFile}" does not exists. Check your setup.`);
    process.exit(1);
  }
  let currentResults: MeasureResults;
  try {
    currentResults = loadFile(currentFile);
  } catch (error) {
    logError(`Error while parsing file: ${currentFile}`, error);
    process.exit(1);
  }

  const hasBaselineFile = fsSync.existsSync(baselineFile);
  if (!hasBaselineFile) {
    logWarning(
      `Baseline results files "${baselineFile}" does not exists. This warning should be ignored only if you are bootstapping perf test setup, otherwise it indicates invalid setup.`
    );
  }

  let baselineResults: MeasureResults | null = null;
  if (hasBaselineFile) {
    try {
      baselineResults = loadFile(baselineFile);
    } catch (error) {
      logError(`Error while parsing file: ${baselineFile}`, error);
      process.exit(1);
    }
  }

  const output = compareResults(currentResults, baselineResults);

  if (outputFormat === 'console' || outputFormat === 'all') {
    printToConsole(output);
  }
  if (outputFormat === 'json' || outputFormat === 'all') {
    await writeToJson(outputFile, output);
  }
  if (outputFormat === 'markdown' || outputFormat === 'all') {
    await writeToMarkdown('.reassure/output.md', output);
  }
}

/**
 * Load performance file and parse it to `PerformanceRecord` object.
 */
export function loadFile(path: string): MeasureResults {
  const contents = fsSync.readFileSync(path, 'utf8');

  const lines = contents
    .split(/\r?\n/)
    .filter((line) => !!line.trim())
    .map((line) => JSON.parse(line));

  let header: MeasureHeader | null = null;
  let entries: MeasureEntry[] = [];

  const hasHeader = lines[0].metadata !== undefined;
  if (hasHeader) {
    header = parseHeader(lines[0]);
    entries = parseMeasureEntries(lines.slice(1));
  } else {
    entries = parseMeasureEntries(lines);
  }

  const keyedEntries: Record<string, MeasureEntry> = {};
  entries.forEach((entry) => {
    keyedEntries[entry.name] = entry;
  });

  return {
    metadata: header?.metadata,
    entries: keyedEntries,
  };
}

/**
 * Compare results between baseline and current entries and categorize.
 */
function compareResults(current: MeasureResults, baseline: MeasureResults | null): CompareResult {
  // Unique test scenario names
  const names = [...new Set([...Object.keys(current.entries), ...Object.keys(baseline?.entries || {})])];
  const compared: CompareEntry[] = [];
  const added: AddedEntry[] = [];
  const removed: RemovedEntry[] = [];

  names.forEach((name) => {
    const currentEntry = current.entries[name];
    const baselineEntry = baseline?.entries[name];

    if (currentEntry && baselineEntry) {
      compared.push(buildCompareEntry(name, currentEntry, baselineEntry));
    } else if (currentEntry) {
      added.push({ name, type: currentEntry.type, current: currentEntry });
    } else if (baselineEntry) {
      removed.push({ name, type: baselineEntry.type, baseline: baselineEntry });
    }
  });

  const reduntantRenderChanged: CompareEntry[] = compared.filter(
    (item) => item.redundantInitialRenderDiff !== 0 || item.redundantUpdateRenderDiff
  );

  const significant = compared
    .filter((item) => item.isDurationDiffSignificant)
    .sort((a, b) => b.durationDiff - a.durationDiff);
  const meaningless = compared
    .filter((item) => !item.isDurationDiffSignificant)
    .sort((a, b) => a.name.localeCompare(b.name));
  const countChanged = compared
    .filter((item) => Math.abs(item.countDiff) > COUNT_DIFF_THRESHOLD)
    .sort((a, b) => b.countDiff - a.countDiff);
  added.sort((a, b) => a.name.localeCompare(b.name));
  removed.sort((a, b) => a.name.localeCompare(b.name));

  return {
    metadata: { current: current.metadata, baseline: baseline?.metadata },
    errors,
    warnings,
    significant,
    meaningless,
    countChanged,
    added,
    removed,
    reduntantRenderChanged,
  };
}

/**
 * Establish statisticial significance of render/execution duration difference build compare entry.
 */
function buildCompareEntry(name: string, current: MeasureEntry, baseline: MeasureEntry): CompareEntry {
  const durationDiff = current.meanDuration - baseline.meanDuration;
  const relativeDurationDiff = durationDiff / baseline.meanDuration;
  const countDiff = current.meanCount - baseline.meanCount;
  const relativeCountDiff = countDiff / baseline.meanCount;

  const redundantInitialRenderDiff =
    (current.redundantRenders?.initialRenders ?? 0) - (baseline.redundantRenders?.initialRenders ?? 0);
  const redundantUpdateRenderDiff =
    (current.redundantRenders?.updates ?? 0) - (baseline.redundantRenders?.updates ?? 0);

  const z = computeZ(baseline.meanDuration, baseline.stdevDuration, current.meanDuration, current.runs);
  const prob = computeProbability(z);

  const isDurationDiffSignificant =
    prob < PROBABILITY_CONSIDERED_SIGNIFICANT && Math.abs(durationDiff) >= DURATION_DIFF_THRESHOLD_SIGNIFICANT;

  return {
    name,
    type: current.type,
    baseline,
    current,
    durationDiff,
    relativeDurationDiff,
    isDurationDiffSignificant,
    countDiff,
    relativeCountDiff,
    redundantInitialRenderDiff,
    redundantUpdateRenderDiff,
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
