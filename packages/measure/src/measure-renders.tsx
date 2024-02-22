import * as React from 'react';
import * as logger from '@callstack/reassure-logger';
import { config } from './config';
import { RunResult, processRunResults } from './measure-helpers';
import { showFlagsOutputIfNeeded, writeTestStats } from './output';
import { resolveTestingLibrary } from './testing-library';
import type { MeasureResult } from './types';

logger.configure({
  verbose: process.env.REASSURE_VERBOSE === 'true' || process.env.REASSURE_VERBOSE === '1',
  silent: process.env.REASSURE_SILENT === 'true' || process.env.REASSURE_SILENT === '1',
});

export interface MeasureRendersOptions {
  runs?: number;
  warmupRuns?: number;
  wrapper?: React.ComponentType<{ children: React.ReactElement }>;
  scenario?: (screen: any) => Promise<any>;
  writeFile?: boolean;
}

export async function measureRenders(
  ui: React.ReactElement,
  options?: MeasureRendersOptions
): Promise<MeasureResult[]> {
  const results = await measureRendersInternal(ui, options);

  if (options?.writeFile !== false) {
    // Currently measureRenders returns only a single result, but in the future it might return multiple ones.
    await writeTestStats(results[0], 'render');
  }

  return results;
}

/**
 * @deprecated The `measurePerformance` function has been renamed to `measureRenders`. The `measurePerformance` alias is now deprecated and will be removed in future releases.
 */
export async function measurePerformance(
  ui: React.ReactElement,
  options?: MeasureRendersOptions
): Promise<MeasureResult[]> {
  logger.warnOnce(
    'The `measurePerformance` function has been renamed to `measureRenders`.\n\nThe `measurePerformance` alias is now deprecated and will be removed in future releases.'
  );

  return await measureRenders(ui, options);
}

async function measureRendersInternal(
  ui: React.ReactElement,
  options?: MeasureRendersOptions
): Promise<MeasureResult[]> {
  const runs = options?.runs ?? config.runs;
  const scenario = options?.scenario;
  const warmupRuns = options?.warmupRuns ?? config.warmupRuns;

  const { render, cleanup } = resolveTestingLibrary();

  showFlagsOutputIfNeeded();

  const runResults: RunResult[] = [];
  let hasTooLateRender = false;
  for (let i = 0; i < runs + warmupRuns; i += 1) {
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

  // Currently we return only a single result, but in the future we plan to return multiple ones.
  const result = processRunResults(runResults, warmupRuns);
  return [result];
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
