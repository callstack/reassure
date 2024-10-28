import * as React from 'react';
import * as logger from '@callstack/reassure-logger';
import { config } from './config';
import { RunResult, processRunResults } from './measure-helpers';
import { showFlagsOutputIfNeeded, writeTestStats } from './output';
import { applyRenderPolyfills, revertRenderPolyfills } from './polyfills';
import { ElementJsonTree, detectRedundantUpdates } from './redundant-renders';
import { resolveTestingLibrary, getTestingLibrary } from './testing-library';
import type { MeasureRendersResults } from './types';

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
  applyRenderPolyfills();

  const runResults: RunResult[] = [];
  const renderJsonTrees: ElementJsonTree[] = [];
  let initialRenderCount = 0;

  for (let iteration = 0; iteration < runs + warmupRuns; iteration += 1) {
    let duration = 0;
    let count = 0;
    let renderResult: any = null;

    const captureRenderDetails = () => {
      // We capture render details only on the first run
      if (iteration !== 0) {
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

      captureRenderDetails();
    };

    const uiToRender = buildUiToRender(ui, handleRender, options?.wrapper);
    renderResult = render(uiToRender);
    captureRenderDetails();

    if (scenario) {
      await scenario(renderResult);
    }

    cleanup();
    global.gc?.();

    runResults.push({ duration, count });
  }

  revertRenderPolyfills();

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
