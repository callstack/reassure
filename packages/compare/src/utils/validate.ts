import { z } from 'zod';
import { MeasureHeaderScheme, MeasureEntryScheme } from '../type-schemas';
import type { MeasureEntry, MeasureHeader } from '../types';
import { hasDuplicateValues } from './array';

const MeasureEntryArraySchema = z
  .array(MeasureEntryScheme)
  .refine((val) => !hasDuplicateValues(val.map((val) => val.name)), {
    message: `Your performance result file contains records with duplicated names.
    Please remove any non-unique names from your test suites and try again.`,
  });

export function parseHeader(header: unknown): MeasureHeader | null {
  return MeasureHeaderScheme.parse(header);
}

export function parseMeasureEntries(entries: unknown): MeasureEntry[] {
  return MeasureEntryArraySchema.parse(entries);
}
