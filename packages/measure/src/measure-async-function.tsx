import { config } from './config';
import type { MeasureResults } from './types';
import { type RunResult, getCurrentTime, processRunResults } from './measure-helpers';
import { showFlagsOutputIfNeeded, writeTestStats } from './output';
import { MeasureFunctionOptions } from './measure-function';

export interface MeasureAsyncFunctionOptions extends MeasureFunctionOptions {}

export async function measureAsyncFunction(
  fn: () => Promise<unknown>,
  options?: MeasureAsyncFunctionOptions
): Promise<MeasureResults> {
  const stats = await measureAsyncFunctionInternal(fn, options);

  if (options?.writeFile !== false) {
    await writeTestStats(stats, 'async function');
  }

  return stats;
}

async function measureAsyncFunctionInternal(
  fn: () => Promise<unknown>,
  options?: MeasureAsyncFunctionOptions
): Promise<MeasureResults> {
  const runs = options?.runs ?? config.runs;
  const warmupRuns = options?.warmupRuns ?? config.warmupRuns;

  showFlagsOutputIfNeeded();

  const runResults: RunResult[] = [];
  for (let i = 0; i < runs + warmupRuns; i += 1) {
    const timeStart = getCurrentTime();
    await fn();
    const timeEnd = getCurrentTime();

    const duration = timeEnd - timeStart;
    runResults.push({ duration, count: 1 });
  }

  return processRunResults(runResults, warmupRuns);
}
