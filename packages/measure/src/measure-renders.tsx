import * as React from 'react';
import * as logger from '@callstack/reassure-logger';
import { config } from './config';
import { RunResult, processRunResults } from './measure-helpers';
import { showFlagsOutputIfNeeded, writeTestStats } from './output';
import { resolveTestingLibrary, getTestingLibrary } from './testing-library';
import type { MeasureRendersResults } from './types';
import { ElementJsonTree, detectRedundantUpdates } from './redundant-renders';

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
): Promise<MeasureRendersResults> {
  const stats = await measureRendersInternal(ui, options);

  if (options?.writeFile !== false) {
    await writeTestStats(stats, 'render');
  }

  return stats;
}

/**
 * @deprecated The `measurePerformance` function has been renamed to `measureRenders`. The `measurePerformance` alias is now deprecated and will be removed in future releases.
 */
export async function measurePerformance(
  ui: React.ReactElement,
  options?: MeasureRendersOptions
): Promise<MeasureRendersResults> {
  logger.warnOnce(
    'The `measurePerformance` function has been renamed to `measureRenders`.\n\nThe `measurePerformance` alias is now deprecated and will be removed in future releases.'
  );

  return await measureRenders(ui, options);
}

async function measureRendersInternal(
  ui: React.ReactElement,
  options?: MeasureRendersOptions
): Promise<MeasureRendersResults> {
  const runs = options?.runs ?? config.runs;
  const scenario = options?.scenario;
  const warmupRuns = options?.warmupRuns ?? config.warmupRuns;

  const { render, cleanup } = resolveTestingLibrary();
  const testingLibrary = getTestingLibrary();

  showFlagsOutputIfNeeded();

  const runResults: RunResult[] = [];
  let hasTooLateRender = false;

  const renderJsonTrees: ElementJsonTree[] = [];
  let initialRenderCount = 0;

  let totalDuration = 0;
  for (let i = 0; ; i += 1) {
    let duration = 0;
    let count = 0;
    let isFinished = false;

    let renderResult: any = null;

    const captureRenderDetails = () => {
      // We capture render details only on the first run
      if (i !== 0) {
        return;
      }

      // Initial render did not finish yet, so there is no "render" result yet and we cannot analyze the element tree.
      if (renderResult == null) {
        initialRenderCount += 1;
        return;
      }

      if (testingLibrary === 'react-native') {
        renderJsonTrees.push(renderResult.toJSON());
      }
    };

    const handleRender = (_id: string, _phase: string, actualDuration: number) => {
      duration += actualDuration;
      count += 1;

      if (isFinished) {
        hasTooLateRender = true;
      }

      captureRenderDetails();
    };

    const uiToRender = buildUiToRender(ui, handleRender, options?.wrapper);
    renderResult = render(uiToRender);
    captureRenderDetails();

    if (scenario) {
      await scenario(renderResult);
    }

    cleanup();

    isFinished = true;
    global.gc?.();

    runResults.push({ duration, count });

    totalDuration += duration;
    const hasMinRuns = i >= runs + warmupRuns;
    const hasMinDuration = totalDuration >= config.minBenchmarkDuration;
    if (hasMinRuns && hasMinDuration) {
      break;
    }
  }

  if (hasTooLateRender) {
    const testName = expect.getState().currentTestName;
    logger.warn(
      `test "${testName}" still re-renders after test scenario finished.\n\nPlease update your code to wait for all renders to finish.`
    );
  }

  return {
    ...processRunResults(runResults, warmupRuns),
    issues: {
      initialUpdateCount: initialRenderCount - 1,
      redundantUpdates: detectRedundantUpdates(renderJsonTrees, initialRenderCount),
    },
  };
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
