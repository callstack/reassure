import * as fs from 'fs/promises';
import React from 'react';
import { render, RenderAPI } from '@testing-library/react-native';
import * as math from 'mathjs';
import type { MeasureRenderResult } from './types';

export const defaultConfig = {
  count: 10,
  dropFirst: 1,
  outputFile: 'perf-results.txt',
};

let config = defaultConfig;

interface MeasureRenderOptions {
  name?: string;
  scale?: number;
  count?: number;
  dropFirst?: number;
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

export async function measureRender(
  ui: React.ReactElement,
  options?: MeasureRenderOptions
): Promise<MeasureRenderResult> {
  const scale = options?.scale ?? 1;
  const count = options?.count ?? config.count;
  const wrapper = options?.wrapper;
  const scenario = options?.scenario;
  const dropFirst = options?.dropFirst ?? config.dropFirst;

  let durations = [];
  let counts = [];

  const wrappedUi = wrapper ? wrapper(ui) : ui;

  for (let i = 0; i < count + dropFirst; i += 1) {
    let duration = 0;
    let count = 0;

    const handleRender = (_id: string, _phase: string, actualDuration: number) => {
      duration += actualDuration;
      count += 1;
    };

    for (let j = 0; j < scale; j += 1) {
      const view = render(
        <React.Profiler id="Test" onRender={handleRender}>
          {wrappedUi}
        </React.Profiler>
      );

      if (scenario) {
        await scenario(view);
      }
    }

    global.gc?.();

    durations.push(duration / scale);
    counts.push(count / scale);
  }

  // Drop first measurement as usually is very high due to warm up
  durations = durations.slice(dropFirst);
  counts = counts.slice(dropFirst);

  const meanDuration = math.mean(durations) as number;
  const stdevDuration = math.std(durations);
  const meanCount = math.mean(counts) as number;
  const stdevCount = math.std(counts);

  return {
    runs: count,
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
  name: string,
  outputFilePath: string = config.outputFile
): Promise<void> {
  if (!name) {
    const errMsg = `You have to provide name in order to save stats properly`;
    console.error(errMsg);
    throw new Error(errMsg);
  }

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
