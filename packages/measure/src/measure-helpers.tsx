import * as math from 'mathjs';
import type { MeasureResult } from './types';

export interface RunResult {
  duration: number;
  count: number;
}

export function processRunResults(results: RunResult[], warmupRuns: number): MeasureResult {
  results = results.slice(warmupRuns);
  results.sort((first, second) => second.duration - first.duration); // duration DESC

  const durations = results.map((result) => result.duration);
  const meanDuration = math.mean(durations) as number;
  const stdevDuration = math.std(...durations);

  const counts = results.map((result) => result.count);
  const meanCount = math.mean(counts) as number;
  const stdevCount = math.std(...counts);

  return {
    runs: results.length,
    meanDuration,
    stdevDuration,
    durations,
    meanCount,
    stdevCount,
    counts,
  };
}
