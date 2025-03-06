import { performance } from 'perf_hooks';
import * as math from 'mathjs';
import type { MeasureResults } from './types';
import { findOutliers } from './outlier-helpers';

export interface RunResult {
  duration: number;
  count: number;
}

type ProcessRunResultsOptions = {
  warmupRuns: number;
  dropOutliers?: boolean;
};

export function processRunResults(inputResults: RunResult[], options: ProcessRunResultsOptions): MeasureResults {
  const warmupResults = inputResults.slice(0, options.warmupRuns);
  const runResults = inputResults.slice(options.warmupRuns);

  const { results, outliers } = options.dropOutliers ? findOutliers(runResults) : { results: runResults };

  const durations = results.map((result) => result.duration);
  const meanDuration = math.mean(durations) as number;
  const stdevDuration = math.std(...durations);
  const warmupDurations = warmupResults.map((result) => result.duration);
  const outlierDurations = outliers?.map((result) => result.duration);

  const counts = results.map((result) => result.count);
  const meanCount = math.mean(counts) as number;
  const stdevCount = math.std(...counts);

  return {
    runs: results.length,
    meanDuration,
    stdevDuration,
    durations,
    warmupDurations,
    outlierDurations,
    meanCount,
    stdevCount,
    counts,
  };
}

export function getCurrentTime() {
  return performance.now();
}
