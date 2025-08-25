import * as React from 'react';
import * as logger from '@callstack/reassure-logger';
import { renderAsync, screen, cleanup } from '@testing-library/react-native';
import { config } from './config';
import { RunResult, processRunResults } from './measure-helpers';
import { showFlagsOutputIfNeeded } from './output';
import { applyRenderPolyfills, revertRenderPolyfills } from './polyfills';
import { ElementJsonTree, detectRedundantUpdates } from './redundant-renders';
import type { MeasureRendersResults } from './types';
import { MeasureRendersOptions } from './measure-renders-common';

logger.configure({
  verbose: process.env.REASSURE_VERBOSE === 'true' || process.env.REASSURE_VERBOSE === '1',
  silent: process.env.REASSURE_SILENT === 'true' || process.env.REASSURE_SILENT === '1',
});

export async function measureRendersNative(
  ui: React.ReactElement,
  options?: MeasureRendersOptions
): Promise<MeasureRendersResults> {
  const runs = options?.runs ?? config.runs;
  const scenario = options?.scenario;
  const warmupRuns = options?.warmupRuns ?? config.warmupRuns;
  const removeOutliers = options?.removeOutliers ?? config.removeOutliers;

  showFlagsOutputIfNeeded();
  applyRenderPolyfills();

  const runResults: RunResult[] = [];
  const renderJsonTrees: ElementJsonTree[] = [];
  let initialRenderCount = 0;

  for (let iteration = 0; iteration < runs + warmupRuns; iteration += 1) {
    await options?.beforeEach?.();

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

      renderJsonTrees.push(renderResult.toJSON());
    };

    const handleRender = (_id: string, _phase: string, actualDuration: number) => {
      duration += actualDuration;
      count += 1;

      captureRenderDetails();
    };

    const uiToRender = buildUiToRender(ui, handleRender, options?.wrapper);
    renderResult = await renderAsync(uiToRender);
    captureRenderDetails();

    if (scenario) {
      await scenario(renderResult);
    }

    await screen.unmountAsync();
    cleanup();
    global.gc?.();

    await options?.afterEach?.();

    runResults.push({ duration, count });
  }

  revertRenderPolyfills();

  return {
    ...processRunResults(runResults, { warmupRuns, removeOutliers }),
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
