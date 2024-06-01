import * as math from 'mathjs';
import type { ReactTestRendererJSON } from 'react-test-renderer';
// eslint-disable-next-line import/no-extraneous-dependencies
import { format as prettyFormat, plugins as prettyFormatPlugins } from 'pretty-format';
import type { MeasureResults } from './types';

export interface RunResult {
  duration: number;
  count: number;
}

export type ToJsonTree = ReactTestRendererJSON | ReactTestRendererJSON[] | null;

export function processRunResults(inputResults: RunResult[], warmupRuns: number): MeasureResults {
  const warmupResults = inputResults.slice(0, warmupRuns);
  const results = inputResults.slice(warmupRuns);

  const durations = results.map((result) => result.duration);
  const meanDuration = math.mean(durations) as number;
  const stdevDuration = math.std(...durations);
  const warmupDurations = warmupResults.map((result) => result.duration);

  const counts = results.map((result) => result.count);
  const meanCount = math.mean(counts) as number;
  const stdevCount = math.std(...counts);

  return {
    runs: results.length,
    meanDuration,
    stdevDuration,
    durations,
    warmupDurations,
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

export function countRedundantUpdates(components: ToJsonTree[]): number {
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
