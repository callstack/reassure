import * as React from 'react';
import * as logger from '@callstack/reassure-logger';
import { config } from './config';
import { ToJsonTree, RunResult, processRunResults, subsequentlyDifferencies } from './measure-helpers';
import { showFlagsOutputIfNeeded, writeTestStats } from './output';
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

  const runResults: RunResult[] = [];
  let hasTooLateRender = false;
  let renderJsonTrees: ToJsonTree[] = [];
  for (let i = 0; i < runs + warmupRuns; i += 1) {
    let duration = 0;
    let count = 0;
    let isFinished = false;

    let screen: any = null;

    const captureJSONs = () => {
      if (i === 0 && testingLibrary === 'react-native') {
        renderJsonTrees.push(screen?.toJSON());
      }
    };

    const handleRender = (_id: string, _phase: string, actualDuration: number) => {
      captureJSONs();

      duration += actualDuration;
      count += 1;

      if (isFinished) {
        hasTooLateRender = true;
      }
    };

    const uiToRender = buildUiToRender(ui, handleRender, options?.wrapper);
    screen = render(uiToRender);
    captureJSONs();

    if (scenario) {
      await scenario(screen);
    }

    cleanup();

    isFinished = true;
    global.gc?.();

    runResults.push({ duration, count });
  }

  const redundantRenders = {
    initialRenders:
      (renderJsonTrees && renderJsonTrees?.filter((measurement) => measurement === undefined).length - 1) ?? 0,
    updates: renderJsonTrees
      ? subsequentlyDifferencies(renderJsonTrees.filter((measurement) => measurement !== undefined))
      : 0,
  };

  if (hasTooLateRender) {
    const testName = expect.getState().currentTestName;
    logger.warn(
      `test "${testName}" still re-renders after test scenario finished.\n\nPlease update your code to wait for all renders to finish.`
    );
  }

  return { ...processRunResults(runResults, warmupRuns), redundantRenders };
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
