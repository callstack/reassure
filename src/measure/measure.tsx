import * as fs from 'fs/promises';
import React from 'react';
import { render, RenderAPI } from '@testing-library/react-native';
import * as math from 'mathjs';
import type { MeasureRenderResult } from './types';

export const defaultConfig = {
  runs: 10,
  dropWorst: 1,
  outputFile: '.reassure/current.perf',
};

let config = defaultConfig;

interface MeasureOptions {
  name?: string;
  runs?: number;
  dropWorst?: number;
  wrapper?: (node: React.ReactElement) => JSX.Element;
  scenario?: (view: RenderAPI) => Promise<any>;
}

export function configure(customConfig: typeof defaultConfig) {
  config = {
    ...defaultConfig,
    ...customConfig,
  };
}

export function resetToDefault() {
  config = defaultConfig;
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

    const view = render(
      <React.Profiler id="Test" onRender={handleRender}>
        {wrappedUi}
      </React.Profiler>
    );

    if (scenario) {
      await scenario(view);
    }

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
  const stdevDuration = math.std(durations);

  const counts = entries.map((entry) => entry.count);
  const meanCount = math.mean(counts) as number;
  const stdevCount = math.std(counts);

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

export async function writeTestStats(
  result: MeasureRenderResult,
  outputFilePath: string = config.outputFile
): Promise<void> {
  const name = expect.getState().currentTestName;
  const line = JSON.stringify({ name, ...result }) + '\n';

  try {
    await fs.appendFile(outputFilePath, line);
  } catch (error) {
    console.error(`Error writing ${outputFilePath}`, error);
    throw error;
  }
}

export async function clearTestStats(outputFilePath: string = config.outputFile): Promise<void> {
  try {
    await fs.unlink(outputFilePath);
  } catch (error) {
    console.warn(`Cannot remove ${outputFilePath}. File doesn't exist or cannot be removed`);
  }
}
