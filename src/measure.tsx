import * as fs from 'fs/promises';
import React from 'react';
import { render, RenderAPI } from '@testing-library/react-native';
import * as math from 'mathjs';

export const defaultConfig = {
  count: 10,
  dropFirst: 1,
  outputFile: 'perf-tests-results.txt',
};

let config = defaultConfig;

interface MeasureRenderOptions {
  scale?: number;
  count?: number;
  dropFirst?: number;
  wrapper?: (node: React.ReactElement) => JSX.Element;
  scenario?: (view: RenderAPI) => Promise<any>;
}

export interface MeasureRenderStats {
  meanDuration: number;
  stdevDuration: number;
  meanCount: number;
  stdevCount: number;
  runs: number;
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
): Promise<MeasureRenderStats> {
  const scale = options?.scale ?? 1;
  const count = options?.count ?? config.count;
  const wrapper = options?.wrapper;
  const scenario = options?.scenario;
  const dropFirst = options?.dropFirst ?? config.dropFirst;

  const durations = [];
  const counts = [];

  const wrappedUi = wrapper ? wrapper(ui) : ui;

  for (let i = 0; i < count + dropFirst; i += 1) {
    let duration = 0;
    let count = 0;

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const handleRender = (
      _id: string,
      _phase: string,
      actualDuration: number
    ) => {
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

    // @ts-expect-error: node internals
    global.gc();

    durations.push(duration / scale);
    counts.push(count / scale);
  }

  const relevantDurations = durations.slice(config.dropFirst);

  const meanDuration = math.mean(relevantDurations) as number;
  const stdevDuration = math.std(relevantDurations);
  const meanCount = math.mean(counts) as number;
  const stdevCount = math.std(counts);

  console.log(`🟢 ${options?.name}`, meanDuration, stdevDuration, durations);

  return {
    meanDuration,
    stdevDuration,
    meanCount,
    stdevCount,
    runs: config.count,
  };
}

export async function clearTestStats(
  outputFilePath: string = config.outputFile
): Promise<void> {
  try {
    await fs.unlink(outputFilePath);
  } catch (error) {
    console.warn(
      `Cannot remove ${outputFilePath}. File doesn't exist or cannot be removed`
    );
  }
}

export async function writeTestStats(
  name: string,
  stats: MeasureRenderStats,
  outputFilePath: string = config.outputFile
): Promise<void> {
  const line = JSON.stringify({ name, ...stats }) + '\n';

  try {
    await fs.appendFile(outputFilePath, line);
  } catch (error) {
    console.error(`Error writing ${outputFilePath}`, error);
    throw error;
  }
}
