/** Type of measured performance characteristic. */
export type MeasureType = 'render' | 'function';

/**
 * Result of a single measurement.
 */
export interface MeasureResult {
  /** Number of times the test subject was run */
  runs: number;

  /** Arithmetic average of measured render/execution durations for each run */
  meanDuration: number;

  /** Standard deviation of measured render/execution durations for each run */
  stdevDuration: number;

  /** Array of measured render/execution durations for each run */
  durations: number[];

  /** Arithmetic average of measured render/execution count for each run */
  meanCount: number;

  /** Standard deviation of measured render/execution count for each run */
  stdevCount: number;

  /** Array of measured render/execution count for each run */
  counts: number[];
}
