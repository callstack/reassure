/** Type (natute) of measured characteristic. */
export type MeasureType = 'render' | 'function';

/**
 * Type representing output of measure functions, e.g. `measurePerformance`, `measureFunction`.
 */
export interface MeasureResults {
  /** Number of times the test subject was run */
  runs: number;

  /** Arithmetic average of measured execution durations for each run */
  meanDuration: number;

  /** Standard deviation of measured execution durations for each run */
  stdevDuration: number;

  /** Array of measured execution durations for each run */
  durations: number[];

  /** Arithmetic average of measured execution count for each run */
  meanCount: number;

  /** Standard deviation of measured execution count for each run */
  stdevCount: number;

  /** Array of measured execution count for each run */
  counts: number[];
}
