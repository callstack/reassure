export interface MeasureRenderResult {
  /* average render duration measured by the tests */
  meanDuration: number;

  /* standard deviation from average render duration measured by the tests */
  stdevDuration: number;

  /* average render count measured by the tests */
  meanCount: number;

  /* standard deviation from average render count measured by the tests */
  stdevCount: number;

  /* number of test runs */
  runs: number;
}

/**
 * Output of specific test scenarion as written to perf results file.
 */
export interface PerformanceEntry extends MeasureRenderResult {
  name: string;
}
