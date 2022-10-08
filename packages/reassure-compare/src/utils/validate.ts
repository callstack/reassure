import { z } from 'zod';
import { hasDuplicateValues } from './array';

const metadataSchema = z.object({
  metadata: z.object({
    branch: z.string(),
    commitHash: z.string(),
  }),
});

const performanceResultEntrySchema = z.object({
  name: z.string(),
  runs: z.number(),
  meanDuration: z.number(),
  stdevDuration: z.number(),
  durations: z.array(z.number()),
  meanCount: z.number(),
  stdevCount: z.number(),
  counts: z.array(z.number()),
});

const perfFileSchema = z
  .array(performanceResultEntrySchema)
  .refine((val) => !hasDuplicateValues(val.map((val) => val.name)), {
    message: `Your performance result file contains records with duplicated names.
    Please remove any non-unique names from your test suites and try again.`,
  });

export function validateAndParseMetadata(metadata: unknown) {
  return metadataSchema.safeParse(metadata);
}

export function validateAndParsePerformanceEntries(perfEntry: unknown) {
  return perfFileSchema.safeParse(perfEntry);
}
