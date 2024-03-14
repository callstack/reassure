/** Parsed performance results file. */
import type { z } from 'zod';
import type { MeasureEntryScheme, MeasureHeaderScheme, MeasureMetadataScheme } from './type-schemas';

export type MeasureHeader = z.infer<typeof MeasureHeaderScheme>;
export type MeasureMetadata = z.infer<typeof MeasureMetadataScheme>;
export type MeasureEntry = z.infer<typeof MeasureEntryScheme>;
export type MeasureType = MeasureEntry['type'];

export interface MeasureResults {
  metadata?: MeasureMetadata;
  entries: Record<string, MeasureEntry>;
}

/**
 * Compare entry for tests that have both baseline and current entry
 */
export interface CompareEntry {
  name: string;
  type: MeasureType;
  current: MeasureEntry;
  baseline: MeasureEntry;
  durationDiff: number;
  relativeDurationDiff: number;
  isDurationDiffSignificant: boolean;
  countDiff: number;
  relativeCountDiff: number;
  redundantInitialRenderDiff: number;
  redundantUpdateRenderDiff: number;
}

/**
 * Compare entry for tests that have only current entry
 */
export interface AddedEntry {
  name: string;
  type: MeasureType;
  current: MeasureEntry;
}

/**
 * Compare entry for tests that have only baseline entry
 */
export interface RemovedEntry {
  name: string;
  type: MeasureType;
  baseline: MeasureEntry;
}

export interface CompareMetadata {
  current?: MeasureMetadata;
  baseline?: MeasureMetadata;
}

/** Output of compare function. */
export interface CompareResult {
  metadata: CompareMetadata;
  significant: CompareEntry[];
  meaningless: CompareEntry[];
  countChanged: CompareEntry[];
  reduntantRenderChanged: CompareEntry[];
  added: AddedEntry[];
  removed: RemovedEntry[];
  errors: string[];
  warnings: string[];
}
