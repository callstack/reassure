import * as React from 'react';
import * as math from 'mathjs';
import { logger } from '@callstack/reassure-logger';
import { config } from './config';
import { showFlagsOuputIfNeeded, writeTestStats } from './output';
import { resolveTestingLibrary } from './testingLibrary';
import type { MeasureRenderResult } from './types';

logger.configure({
  verbose: process.env.REASSURE_VERBOSE === 'true' || process.env.REASSURE_VERBOSE === '1',
  silent: process.env.REASSURE_SILENT === 'true' || process.env.REASSURE_SILENT === '1',
});

export interface MeasureOptions {
  runs?: number;
  dropWorst?: number;
  wrapper?: React.ComponentType<{ children: React.ReactElement }>;
  scenario?: (screen: any) => Promise<any>;
}

export async function measurePerformance(
  ui: React.ReactElement,
  options?: MeasureOptions
): Promise<MeasureRenderResult> {
  const stats = await measureRender(ui, options);
  await writeTestStats(stats);

  return stats;
}

export async function measureRender(ui: React.ReactElement, options?: MeasureOptions): Promise<MeasureRenderResult> {
  const runs = options?.runs ?? config.runs;
  const scenario = options?.scenario;
  const dropWorst = options?.dropWorst ?? config.dropWorst;

  const { render, cleanup } = resolveTestingLibrary();

  showFlagsOuputIfNeeded();

  const runResults: RunResult[] = [];
  let hasTooLateRender = false;
  for (let i = 0; i < runs + dropWorst; i += 1) {
    let duration = 0;
    let count = 0;
    let isFinished = false;

    const handleRender = (_id: string, _phase: string, actualDuration: number) => {
      duration += actualDuration;
      count += 1;

      if (isFinished) {
        hasTooLateRender = true;
      }
    };

    const uiToRender = buildUiToRender(ui, handleRender, options?.wrapper);
    const screen = render(uiToRender);

    if (scenario) {
      await scenario(screen);
    }

    cleanup();

    isFinished = true;
    global.gc?.();

    runResults.push({ duration, count });
  }

  if (hasTooLateRender) {
    const testName = expect.getState().currentTestName;
    logger.warn(
      `test "${testName}" still re-renders after test scenario finished.\n\nPlease update your code to wait for all renders to finish.`
    );
  }

  return processRunResults(runResults, dropWorst);
}

export function buildUiToRender(
  ui: React.ReactElement,
  onRender: React.ProfilerOnRenderCallback,
  Wrapper?: React.ComponentType<{ children: React.ReactElement }>
) {
  const uiWithProfiler = (
    <React.Profiler id="REASSURE_ROOT" onRender={onRender}>
      {ui}
    </React.Profiler>
  );

  return Wrapper ? <Wrapper>{uiWithProfiler}</Wrapper> : uiWithProfiler;
}

interface RunResult {
  duration: number;
  count: number;
}

export function processRunResults(results: RunResult[], dropWorst: number) {
  results.sort((first, second) => second.duration - first.duration); // duration DESC
  results = results.slice(dropWorst);

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
