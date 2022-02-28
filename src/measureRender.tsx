import * as fs from 'fs/promises';
import React from 'react';
import { render, RenderAPI } from '@testing-library/react-native';
import * as math from 'mathjs';

const config = {
  count: 10,
  dropFirst: 1,
  outputFile: 'perf-tests-results.txt',
};

interface MeasureRenderOptions {
  scale?: number;
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

export async function measureRender(
  ui: React.ReactElement,
  options?: MeasureRenderOptions
): Promise<MeasureRenderStats> {
  const scale = options?.scale ?? 1;
  const wrapper = options?.wrapper;
  const scenario = options?.scenario;

  const durations = [];
  const counts = [];

  const wrappedUi = wrapper ? wrapper(ui) : ui;

  for (let i = 0; i < config.count + config.dropFirst; i += 1) {
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

export async function clearTestStats(): Promise<void> {
  try {
    await fs.unlink(config.outputFile);
  } catch (error) {
    console.error(`Error while removing ${config.outputFile}`, error);
  }
}

export async function writeTestStats(
  name: string,
  stats: MeasureRenderStats
): Promise<void> {
  const line = JSON.stringify({ name, ...stats }) + '\n';

  try {
    await fs.appendFile(config.outputFile, line);
  } catch (error) {
    console.error(`Error writing ${config.outputFile}`, error);
    throw error;
  }
}
