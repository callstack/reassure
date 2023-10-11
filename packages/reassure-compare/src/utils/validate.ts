import type { PerformanceEntry, PerformanceHeader } from 'src/types';
import { z } from 'zod';
import { performanceHeaderSchema, performanceEntrySchema } from '../type-schemas';
import { hasDuplicateValues } from './array';

const performanceEntriesSchema = z
  .array(performanceEntrySchema)
  .refine((val) => !hasDuplicateValues(val.map((val) => val.name)), {
    message: `Your performance result file contains records with duplicated names.
    Please remove any non-unique names from your test suites and try again.`,
  });

export function parseHeader(header: unknown): PerformanceHeader | null {
  return performanceHeaderSchema.parse(header);
}

export function parsePerformanceEntries(entries: unknown): PerformanceEntry[] {
  return performanceEntriesSchema.parse(entries);
}
