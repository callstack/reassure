import type { PerformanceEntry } from 'src/measure/types';

export const STATISTICAL_SIGNIFICANCE = ['SIGNIFICANT', 'INSIGNIFICANT', 'MEANINGLESS'] as const;

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
  durationDiffPercent: number;
  durationDiffSignificance: StatisticalSignificance;
  countDiff: number;
  countDiffPercent: number;
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
};
