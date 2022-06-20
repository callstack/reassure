/**
 * Type representing output from `measureRender` function.
 */
export interface MeasureRenderResult {
  /** Number of times the measurment test was run */
  runs: number;

  /** Array of measured render durations for each run */
  durations: number[];

  /** Arithmetic average of measured render durations for each run */
  meanDuration: number;

  /* Standard deviation of measured render durations for each run */
  stdevDuration: number;

  /** Array of measured render counts for each run */
  counts: number[];

  /** Arithmetic average of measured render counts for each run */
  meanCount: number;

  /** Standard deviation of measured render counts for each run */
  stdevCount: number;
}

/**
 * Output of specific test scenarion as written to perf results file.
 */
export interface PerformanceEntry extends MeasureRenderResult {
  name: string;
}
