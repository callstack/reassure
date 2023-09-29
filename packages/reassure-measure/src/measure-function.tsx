import { performance } from 'perf_hooks';
import { config } from './config';
import type { MeasureResults } from './types';
import { type RunResult, processRunResults } from './measure-helpers';
import { showFlagsOuputIfNeeded, writeTestStats } from './output';

interface MeasureFunctionOptions {
  runs?: number;
  warmupRuns?: number;
}

export async function measureFunction(fn: () => void, options?: MeasureFunctionOptions): Promise<MeasureResults> {
  const stats = await measureFunctionInternal(fn, options);
  await writeTestStats(stats);

  return stats;
}

export function measureFunctionInternal(fn: () => void, options?: MeasureFunctionOptions): MeasureResults {
  const runs = options?.runs ?? config.runs;
  const warmupRuns = options?.warmupRuns ?? config.warmupRuns;

  showFlagsOuputIfNeeded();

  const runResults: RunResult[] = [];
  for (let i = 0; i < runs + warmupRuns; i += 1) {
    const timeStart = getCurrentTime();
    fn();
    const timeEnd = getCurrentTime();

    const duration = timeEnd - timeStart;
    runResults.push({ duration, count: 1 });
  }

  return processRunResults(runResults, warmupRuns);
}

function getCurrentTime() {
  return performance.now();
}
