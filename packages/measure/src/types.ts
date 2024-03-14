/** Type of measured performance characteristic. */
export type MeasureType = 'render' | 'function';

interface RendundantRendersResults {
  initialRenders: number;
  updates: number;
}

/**
 * Type representing the result of `measure*` functions.
 */
export interface MeasureResults {
  /** Number of times the test subject was run */
  runs: number;

  /** Arithmetic average of measured render/execution durations for each run */
  meanDuration: number;

  /** Standard deviation of measured render/execution durations for each run */
  stdevDuration: number;

  /** Array of measured render/execution durations for each run */
  durations: number[];

  /** Array of measured render/execution durations for each warmup run   */
  warmupDurations: number[];

  /** Arithmetic average of measured render/execution count for each run */
  meanCount: number;

  /** Standard deviation of measured render/execution count for each run */
  stdevCount: number;

  /** Array of measured render/execution count for each run */
  counts: number[];
}

export interface MeasureRendersResults extends MeasureResults {
  redundantRenders: RendundantRendersResults;
}
