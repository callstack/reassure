export const STATISTICAL_SIGNIFICANCE = ['SIGNIFICANT', 'INSIGNIFICANT', 'MEANINGLESS'] as const;

/**
 * Entry in the performance results file.
 */
export interface PerformanceEntry {
  /** Name of the test scenario */
  name: string;

  /** Number of times the measurment test was run */
  runs: number;

  /** Array of measured render durations for each run */
  durations: number[];

  /** Arithmetic average of measured render durations for each run */
  meanDuration: number;

  /* Standard deviation of measured render durations for each run */
  stdevDuration: number;

  /** Array of measured render counts for each run */
  counts: number[];

  /** Arithmetic average of measured render counts for each run */
  meanCount: number;

  /** Standard deviation of measured render counts for each run */
  stdevCount: number;
}

/**
 * Type of the performance measure change as compared to the baseline results
 */
export type StatisticalSignificance = typeof STATISTICAL_SIGNIFICANCE[number];

/**
 * Compare entry for tests that have both baseline and current entry
 */
export interface CompareEntry {
  name: string;
  current: PerformanceEntry;
  baseline: PerformanceEntry;
  durationDiff: number;
  relativeDurationDiff: number;
  durationDiffSignificance: StatisticalSignificance;
  countDiff: number;
  relativeCountDiff: number;
}

/**
 * Compare entry for tests that have only current entry
 */
export interface AddedEntry {
  name: string;
  current: PerformanceEntry;
}

/**
 * Compare entry for tests that have only baseline entry
 */
export interface RemovedEntry {
  name: string;
  baseline: PerformanceEntry;
}

/**
 * Output of compare function
 */
export type CompareResult = {
  significant: CompareEntry[];
  insignificant: CompareEntry[];
  meaningless: CompareEntry[];
  countChanged: CompareEntry[];
  added: AddedEntry[];
  removed: RemovedEntry[];
  errors: string[];
  warnings: string[];
};
