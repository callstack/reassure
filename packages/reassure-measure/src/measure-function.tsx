import { config } from './config';
import type { MeasureResults } from './types';
import { type RunResult, processRunResults } from './measure-helpers';
import { showFlagsOuputIfNeeded, writeTestStats } from './output';

interface MeasureFunctionOptions {
  runs?: number;
  dropWorst?: number;
}

export async function measureFunction(fn: () => void, options?: MeasureFunctionOptions): Promise<MeasureResults> {
  const stats = await measureFunctionInternal(fn, options);
  await writeTestStats(stats);

  return stats;
}

export function measureFunctionInternal(fn: () => void, options?: MeasureFunctionOptions): MeasureResults {
  const runs = options?.runs ?? config.runs;
  const dropWorst = options?.dropWorst ?? config.warmupRuns;

  showFlagsOuputIfNeeded();

  const runResults: RunResult[] = [];
  for (let i = 0; i < runs + dropWorst; i += 1) {
    const timeStart = getCurrentTime();
    fn();
    const timeEnd = getCurrentTime();

    const duration = Number((timeEnd - timeStart) / 1_000_000n);
    runResults.push({ duration, count: 1 });
  }

  return processRunResults(runResults, dropWorst);
}

function getCurrentTime() {
  return process.hrtime.bigint();
}
