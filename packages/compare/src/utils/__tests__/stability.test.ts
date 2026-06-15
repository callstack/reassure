import type { MeasureResults } from '../../types';
import { calculateEntryCV, calculateRunStability } from '../stability';

describe('calculateRunStability', () => {
  it('calculates mean-duration-weighted average CV', () => {
    const results: MeasureResults = {
      entries: {
        fast: buildEntry({ name: 'fast', durations: [8, 12] }),
        slow: buildEntry({ name: 'slow', durations: [81, 99] }),
      },
    };

    expect(calculateRunStability(results).weightedAverage).toBeCloseTo(0.1556);
  });

  it('ignores entries with zero mean duration', () => {
    const results: MeasureResults = {
      entries: {
        zero: buildEntry({ name: 'zero', meanDuration: 0, stdevDuration: 1 }),
        regular: buildEntry({ name: 'regular', durations: [45, 55] }),
      },
    };

    expect(calculateRunStability(results).weightedAverage).toBeCloseTo(0.1414);
  });
});

describe('calculateEntryCV', () => {
  it('includes removed outlier durations', () => {
    const entry = buildEntry({
      name: 'with outlier',
      durations: [10, 10],
      outlierDurations: [40],
    });

    expect(calculateEntryCV(entry)).toBeCloseTo(0.866);
  });

  it('does not include warmup durations', () => {
    const entry = buildEntry({
      name: 'with warmup',
      durations: [10, 10],
      warmupDurations: [40],
    });

    expect(calculateEntryCV(entry)).toBe(0);
  });
});

function buildEntry({
  name,
  meanDuration = 10,
  stdevDuration = 1,
  durations = [],
  warmupDurations,
  outlierDurations,
}: {
  name: string;
  meanDuration?: number;
  stdevDuration?: number;
  durations?: number[];
  warmupDurations?: number[];
  outlierDurations?: number[];
}) {
  return {
    name,
    type: 'function' as const,
    runs: 10,
    meanDuration,
    stdevDuration,
    durations,
    warmupDurations,
    outlierDurations,
    meanCount: 1,
    stdevCount: 0,
    counts: [],
  };
}
