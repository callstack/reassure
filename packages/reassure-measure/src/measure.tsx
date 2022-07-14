import * as React from 'react';
import * as math from 'mathjs';
import { config } from './config';
import { showFlagsOuputIfNeeded, writeTestStats } from './output';
import type { MeasureRenderResult } from './types';

export interface MeasureOptions {
  runs?: number;
  dropWorst?: number;
  wrapper?: (node: React.ReactElement) => JSX.Element;
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
  const wrapper = options?.wrapper;
  const scenario = options?.scenario;
  const dropWorst = options?.dropWorst ?? config.dropWorst;

  let entries = [];
  let hasTooLateRender = false;

  const wrappedUi = wrapper ? wrapper(ui) : ui;

  showFlagsOuputIfNeeded();

  if (!config.render) {
    console.error(
      '❌ Reassure: unable to find "render" function. Do you have "@testing-library/react-native" installed?'
    );
    throw new Error('Unable to find "render" function');
  }

  if (!config.cleanup) {
    console.error(
      '❌ Reassure: unable to find "cleanup" function. Do you have "@testing-library/react-native" installed?'
    );
    throw new Error('Unable to find "cleanup" function');
  }

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

    const screen = config.render(
      <React.Profiler id="Test" onRender={handleRender}>
        {wrappedUi}
      </React.Profiler>
    );

    if (scenario) {
      await scenario(screen);
    }

    config.cleanup();

    isFinished = true;
    global.gc?.();

    entries.push({ duration, count });
  }

  if (hasTooLateRender) {
    const testName = expect.getState().currentTestName;
    console.error(
      `Warning: test "${testName}" still re-renders after test scenario finished.\n\nPlease update your code to wait for all renders to finish.`
    );
  }

  // Drop worst measurements outliers (usually warm up runs)
  entries.sort((first, second) => second.duration - first.duration); // duration DESC
  entries = entries.slice(dropWorst);

  const durations = entries.map((entry) => entry.duration);
  const meanDuration = math.mean(durations) as number;
  const stdevDuration = math.std(...durations);

  const counts = entries.map((entry) => entry.count);
  const meanCount = math.mean(counts) as number;
  const stdevCount = math.std(...counts);

  return {
    runs,
    meanDuration,
    stdevDuration,
    durations,
    meanCount,
    stdevCount,
    counts,
  };
}
