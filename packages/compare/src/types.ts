/** Parsed performance results file. */
import type { z } from 'zod';
import type {
  MeasureEntryScheme,
  MeasureHeaderScheme,
  MeasureMetadataScheme,
  RenderIssuesScheme,
} from './type-schemas';

export type MeasureHeader = z.infer<typeof MeasureHeaderScheme>;
export type MeasureMetadata = z.infer<typeof MeasureMetadataScheme>;
export type MeasureEntry = z.infer<typeof MeasureEntryScheme>;
export type RenderIssues = z.infer<typeof RenderIssuesScheme>;
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
  stability: EntryStability;
  durationDiff: number;
  relativeDurationDiff: number;
  isDurationDiffSignificant: boolean;
  countDiff: number;
  relativeCountDiff: number;
}

/**
 * Compare entry for tests that have only current entry
 */
export interface AddedEntry {
  name: string;
  type: MeasureType;
  current: MeasureEntry;
  stability: EntryStability;
  baseline?: undefined;
}

/**
 * Compare entry for tests that have only baseline entry
 */
export interface RemovedEntry {
  name: string;
  type: MeasureType;
  baseline: MeasureEntry;
  stability: EntryStability;
  current?: undefined;
}

export interface CompareMetadata {
  current?: MeasureMetadata;
  baseline?: MeasureMetadata;
}

export interface EntryStability {
  currentCV?: number;
  baselineCV?: number;
  cvDiff?: number;
}

export interface RunStability {
  weightedAverageCV: number;
}

export interface CompareStability {
  current: RunStability;
  baseline?: RunStability;
  weightedAverageCVDiff?: number;
}

/** Output of compare function. */
export interface CompareResult {
  metadata: CompareMetadata;
  significant: CompareEntry[];
  meaningless: CompareEntry[];
  countChanged: CompareEntry[];
  renderIssues: Array<CompareEntry | AddedEntry>;
  added: AddedEntry[];
  removed: RemovedEntry[];
  errors: string[];
  warnings: string[];
  stability: CompareStability;
}
