export interface MeasureRenderResult {
  /* average render duration measured by the tests */
  meanDuration: number;

  /* standard deviation from average render duration measured by the tests */
  stdevDuration: number;

  /* average render count measured by the tests */
  meanCount: number;

  /* standard deviation from average render count measured by the tests */
  stdevCount: number;

  /* number of test runs */
  runs: number;
}

/**
 * Output of specific test scenarion as written to perf results file.
 */
export interface PerfResultEntry extends MeasureRenderResult {
  name: string;
}

export const STATISTIC_SIGNIFICANCE = [
  'SIGNIFICANT',
  'INSIGNIFICANT',
  'MEANINGLESS',
] as const;

/**
 * Type of the performance measure change as compared to the baseline.txt file
 */
export type StatisticSignificance = typeof STATISTIC_SIGNIFICANCE[number];

/**
 * Comparison entry for tests that have both baseline and current entry
 */
export interface ComparisonRegularResult {
  name: string;
  current: PerfResultEntry;
  baseline: PerfResultEntry;
  durationDiff: number;
  durationDiffPercent: number;
  durationDiffSignificance: StatisticSignificance;
  countDiff: number;
  countDiffPercent: number;
}

/**
 * Comparison entry for tests that have only current entry
 */
export interface ComparisonAddedResult {
  name: string;
  current: PerfResultEntry;
}

/**
 * Comparison entry for tests that have only baseline entry
 */
export interface ComparisonRemovedResult {
  name: string;
  baseline: PerfResultEntry;
}

/**
 * Output data structure to be consumed by any of the outputting functions
 */
export type ComparisonOutput = {
  significant: ComparisonRegularResult[];
  insignificant: ComparisonRegularResult[];
  meaningless: ComparisonRegularResult[];
  countChanged: ComparisonRegularResult[];
  added: ComparisonAddedResult[];
  removed: ComparisonRemovedResult[];
};
