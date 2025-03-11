import { config } from './config';
import type { MeasureResults } from './types';
import { type RunResult, getCurrentTime, processRunResults } from './measure-helpers';
import { showFlagsOutputIfNeeded, writeTestStats } from './output';

export interface MeasureFunctionOptions {
  runs?: number;
  warmupRuns?: number;
  removeOutliers?: boolean;
  writeFile?: boolean;
  beforeEach?: () => Promise<void> | void;
  afterEach?: () => Promise<void> | void;
}

export async function measureFunction(fn: () => void, options?: MeasureFunctionOptions): Promise<MeasureResults> {
  const stats = await measureFunctionInternal(fn, options);

  if (options?.writeFile !== false) {
    await writeTestStats(stats, 'function');
  }

  return stats;
}

async function measureFunctionInternal(fn: () => void, options?: MeasureFunctionOptions): Promise<MeasureResults> {
  const runs = options?.runs ?? config.runs;
  const warmupRuns = options?.warmupRuns ?? config.warmupRuns;
  const removeOutliers = options?.removeOutliers ?? config.removeOutliers;

  showFlagsOutputIfNeeded();

  const runResults: RunResult[] = [];
  for (let i = 0; i < runs + warmupRuns; i += 1) {
    await options?.beforeEach?.();

    const timeStart = getCurrentTime();
    fn();
    const timeEnd = getCurrentTime();

    await options?.afterEach?.();

    const duration = timeEnd - timeStart;
    runResults.push({ duration, count: 1 });
  }

  return processRunResults(runResults, { warmupRuns, removeOutliers });
}
