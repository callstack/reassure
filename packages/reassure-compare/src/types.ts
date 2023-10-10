/** Parsed performance results file. */
import type { z } from 'zod';
import type { performanceEntrySchema, performanceHeaderSchema, performanceMetadataSchema } from './utils/validate';

export type PerformanceHeader = z.infer<typeof performanceHeaderSchema>;
export type PerformanceMetadata = z.infer<typeof performanceMetadataSchema>;
export type PerformanceEntry = z.infer<typeof performanceEntrySchema>;
export type MeasureType = PerformanceEntry['type'];

export interface PerformanceResults {
  metadata?: PerformanceMetadata;
  entries: Record<string, PerformanceEntry>;
}

/**
 * Common interface for all compare entries
 */
interface BaseEntry {
  name: string;
  type: MeasureType;
}

/**
 * Compare entry for tests that have both baseline and current entry
 */
export interface CompareEntry extends BaseEntry {
  current: PerformanceEntry;
  baseline: PerformanceEntry;
  durationDiff: number;
  relativeDurationDiff: number;
  isDurationDiffSignificant: boolean;
  countDiff: number;
  relativeCountDiff: number;
}

/**
 * Compare entry for tests that have only current entry
 */
export interface AddedEntry extends BaseEntry {
  current: PerformanceEntry;
}

/**
 * Compare entry for tests that have only baseline entry
 */
export interface RemovedEntry extends BaseEntry {
  baseline: PerformanceEntry;
}

export interface CompareMetadata {
  current?: PerformanceMetadata;
  baseline?: PerformanceMetadata;
}

/** Output of compare function. */
export interface CompareResult {
  metadata: CompareMetadata;
  significant: CompareEntry[];
  meaningless: CompareEntry[];
  countChanged: CompareEntry[];
  added: AddedEntry[];
  removed: RemovedEntry[];
  errors: string[];
  warnings: string[];
}
