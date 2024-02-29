import { performance } from 'perf_hooks';
import { config } from './config';
import type { MeasureResult } from './types';
import { type RunResult, processRunResults } from './measure-helpers';
import { showFlagsOutputIfNeeded, writeTestStats } from './output';

export interface MeasureFunctionOptions {
  runs?: number;
  warmupRuns?: number;
  writeFile?: boolean;
}

export async function measureFunction(fn: () => void, options?: MeasureFunctionOptions): Promise<MeasureResult[]> {
  const results = await measureFunctionInternal(fn, options);

  if (options?.writeFile !== false) {
    // Currently measureRenders returns only a single result, but in the future it might return multiple ones.
    await writeTestStats(results[0], 'function');
  }

  return results;
}

function measureFunctionInternal(fn: () => void, options?: MeasureFunctionOptions): MeasureResult[] {
  const runs = options?.runs ?? config.runs;
  const warmupRuns = options?.warmupRuns ?? config.warmupRuns;

  showFlagsOutputIfNeeded();

  const runResults: RunResult[] = [];
  for (let i = 0; i < runs + warmupRuns; i += 1) {
    const timeStart = getCurrentTime();
    fn();
    const timeEnd = getCurrentTime();

    const duration = timeEnd - timeStart;
    runResults.push({ duration, count: 1 });
  }

  // Currently we return only a single result, but in the future we plan to return multiple ones.
  const result = processRunResults(runResults, warmupRuns);
  return [result];
}

function getCurrentTime() {
  return performance.now();
}
