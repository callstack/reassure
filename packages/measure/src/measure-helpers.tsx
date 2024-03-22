import * as math from 'mathjs';

// eslint-disable-next-line import/no-extraneous-dependencies
import { format as prettyFormat, plugins as prettyFormatPlugins } from 'pretty-format';
import type { MeasureResults } from './types';

export interface RunResult {
  duration: number;
  count: number;
}

export type RenderMeasureResult = Array<Object | undefined>;

export function processRunResults(
  results: RunResult[],
  warmupRuns: number,
  renderMeasure?: RenderMeasureResult
): MeasureResults {
  results = results.slice(warmupRuns);
  results.sort((first, second) => second.duration - first.duration); // duration DESC

  const durations = results.map((result) => result.duration);
  const meanDuration = math.mean(durations) as number;
  const stdevDuration = math.std(...durations);

  const counts = results.map((result) => result.count);
  const meanCount = math.mean(counts) as number;
  const stdevCount = math.std(...counts);

  return {
    runs: results.length,
    redundantRender: {
      initial: (renderMeasure && renderMeasure?.filter((measurement) => measurement === undefined).length - 1) ?? 0,
      update: renderMeasure
        ? subsequentlyDifferencies(renderMeasure.filter((measurement) => measurement !== undefined))
        : 0,
    },
    meanDuration,
    stdevDuration,
    durations,
    meanCount,
    stdevCount,
    counts,
  };
}

const { AsymmetricMatcher, DOMCollection, DOMElement, Immutable, ReactElement, ReactTestComponent } =
  prettyFormatPlugins;
const PLUGINS = [ReactTestComponent, ReactElement, DOMElement, DOMCollection, Immutable, AsymmetricMatcher];
const FORMAT_OPTIONS = {
  plugins: PLUGINS,
};
export function subsequentlyDifferencies(components: RenderMeasureResult): number {
  const formatOptionsZeroIndent = { ...FORMAT_OPTIONS, indent: 0 };
  let count = 0;

  for (let i = 0; i < components.length - 1; i++) {
    const aCompare = prettyFormat(components[i], formatOptionsZeroIndent);
    const bCompare = prettyFormat(components[i + 1], formatOptionsZeroIndent);
    if (aCompare === bCompare) {
      count++;
    }
  }
  return count;
}
