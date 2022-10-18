import { z } from 'zod';
import { hasDuplicateValues } from './array';

const performanceMetadataSchema = z.object({
  branch: z.string().optional(),
  commitHash: z.string().optional(),
});

export type PerformanceMetadata = z.infer<typeof performanceMetadataSchema>;

const performanceHeaderSchema = z.object({
  metadata: performanceMetadataSchema,
});

export type PerformanceHeader = z.infer<typeof performanceHeaderSchema>;

const performanceEntrySchema = z.object({
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

export type PerformanceEntry = z.infer<typeof performanceEntrySchema>;

const perfFileSchema = z
  .array(performanceEntrySchema)
  .refine((val) => !hasDuplicateValues(val.map((val) => val.name)), {
    message: `Your performance result file contains records with duplicated names.
    Please remove any non-unique names from your test suites and try again.`,
  });

export function parseMetadata(metadata: unknown) {
  return performanceHeaderSchema.safeParse(metadata);
}

export function validateAndParsePerformanceEntries(perfEntry: unknown) {
  return perfFileSchema.safeParse(perfEntry);
}
