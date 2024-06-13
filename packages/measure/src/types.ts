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
}

export interface MeasureRendersResults extends MeasureResults {
  initialRenderCount: number;
  redundantUpdates: number[];
  redundantRenders: RedundantRenders;
}

/** Holds info about detected redundant re-renders. */
export interface RedundantRenders {
  /**
   * Re-renders that happened immediately after component was created
   * e.g., synchronous `useEffects` containing `setState`.
   *
   * This types of re-renders can be optimized by initializing the component with proper state in the initial render.
   */
  initial: number;

  /**
   * Re-renders that resulted in rendering the same output as the previous render.
   */
  update: number;
}
