/** Type of measured performance characteristic. */
export type MeasureType = 'render' | 'function';

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

  /** Errors that occurred during the test */
  errors?: string[];

  /** Warnings that occurred during the test */
  warnings?: string[];
}

export interface MeasureRendersResults extends MeasureResults {
  issues: RenderIssues;
}

export interface RenderIssues {
  /**
   * Update renders (re-renders) that happened immediately after component was created
   * e.g., synchronous `useEffects` containing `setState`.
   *
   * This types of re-renders can be optimized by initializing the component with proper state in
   * the initial render.
   */
  initialUpdateCount: number;

  /**
   * Re-renders that resulted in rendering the same output as the previous render. This arrays contains numbers of render
   */
  redundantUpdates: number[];
}
