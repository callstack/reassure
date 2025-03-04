import { performance } from 'perf_hooks';
import * as math from 'mathjs';
import type { MeasureResults } from './types';

export interface RunResult {
  duration: number;
  count: number;
}

export function getCurrentTime() {
  return performance.now();
}

export function processRunResults(inputResults: RunResult[], warmupRuns: number): MeasureResults {
  const warmupResults = inputResults.slice(0, warmupRuns);
  const results = inputResults.slice(warmupRuns);

  const durations = results.map((result) => result.duration);
  const meanDuration = math.mean(durations) as number;
  const stdevDuration = math.std(...durations);
  const warmupDurations = warmupResults.map((result) => result.duration);

  const counts = results.map((result) => result.count);
  const meanCount = math.mean(counts) as number;
  const stdevCount = math.std(...counts);

  return {
    runs: results.length,
    meanDuration,
    stdevDuration,
    durations,
    warmupDurations,
    meanCount,
    stdevCount,
    counts,
  };
}
