import { z } from 'zod';
import { hasDuplicateValues } from './array';

export const performanceMetadataSchema = z.object({
  branch: z.string().optional(),
  commitHash: z.string().optional(),
});

export const performanceHeaderSchema = z.object({
  metadata: performanceMetadataSchema,
});

export const performanceEntrySchema = z.object({
  /** Name of the test scenario */
  name: z.string(),

  /** Number of times the measurment test was run */
  runs: z.number(),

  /** Arithmetic average of measured render durations for each run */
  meanDuration: z.number(),

  /** Standard deviation of measured render durations for each run */
  stdevDuration: z.number(),

  /** Array of measured render durations for each run */
  durations: z.array(z.number()),

  /** Arithmetic average of measured render counts for each run */
  meanCount: z.number(),

  /** Standard deviation of measured render counts for each run */
  stdevCount: z.number(),

  /** Array of measured render counts for each run */
  counts: z.array(z.number()),
});

const performanceEntriesSchema = z
  .array(performanceEntrySchema)
  .refine((val) => !hasDuplicateValues(val.map((val) => val.name)), {
    message: `Your performance result file contains records with duplicated names.
    Please remove any non-unique names from your test suites and try again.`,
  });

export function parseHeader(header: unknown) {
  return performanceHeaderSchema.parse(header);
}

export function parsePerformanceEntries(entries: unknown) {
  return performanceEntriesSchema.parse(entries);
}
