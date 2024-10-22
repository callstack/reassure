import { z } from 'zod';

/** Metadata information for performance results. */
export const MeasureMetadataScheme = z.object({
  branch: z.string().optional(),
  commitHash: z.string().optional(),
  creationDate: z.string().datetime().optional(),
});

/** Header of performance results file. */
export const MeasureHeaderScheme = z.object({
  metadata: MeasureMetadataScheme,
});

export const RenderIssuesScheme = z.object({
  initialUpdateCount: z.number().optional(),
  redundantUpdates: z.array(z.number()).optional(),
});

/** Entry in the performance results file. */
export const MeasureEntryScheme = z.object({
  /** Name of the test scenario. */
  name: z.string(),

  /** Type of the measured characteristic (render, function execution). */
  type: z.enum(['render', 'function']).default('render'),

  /** Number of times the measurement test was run. */
  runs: z.number(),

  /** Arithmetic average of measured render/execution durations for each run. */
  meanDuration: z.number(),

  /** Standard deviation of measured render/execution durations for each run. */
  stdevDuration: z.number(),

  /** Array of measured render/execution durations for each run. */
  durations: z.array(z.number()),

  /** Array of measured render/execution durations for each run. */
  warmupDurations: z.optional(z.array(z.number())),

  /** Arithmetic average of measured render/execution counts for each run. */
  meanCount: z.number(),

  /** Standard deviation of measured render/execution counts for each run. */
  stdevCount: z.number(),

  /** Array of measured render/execution counts for each run. */
  counts: z.array(z.number()),

  issues: z.optional(RenderIssuesScheme),

  warnings: z.optional(z.array(z.string())),
});
