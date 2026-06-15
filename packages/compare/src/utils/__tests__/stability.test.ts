import type { MeasureResults } from '../../types';
import { calculateRunStability } from '../stability';

describe('calculateRunStability', () => {
  it('calculates mean-duration-weighted average CV', () => {
    const results: MeasureResults = {
      entries: {
        fast: buildEntry({ name: 'fast', meanDuration: 10, stdevDuration: 2 }),
        slow: buildEntry({ name: 'slow', meanDuration: 90, stdevDuration: 9 }),
      },
    };

    expect(calculateRunStability(results)).toEqual({ weightedAverageCV: 0.11 });
  });

  it('ignores entries with zero mean duration', () => {
    const results: MeasureResults = {
      entries: {
        zero: buildEntry({ name: 'zero', meanDuration: 0, stdevDuration: 1 }),
        regular: buildEntry({ name: 'regular', meanDuration: 50, stdevDuration: 5 }),
      },
    };

    expect(calculateRunStability(results)).toEqual({ weightedAverageCV: 0.1 });
  });
});

function buildEntry({
  name,
  meanDuration,
  stdevDuration,
}: {
  name: string;
  meanDuration: number;
  stdevDuration: number;
}) {
  return {
    name,
    type: 'function' as const,
    runs: 10,
    meanDuration,
    stdevDuration,
    durations: [],
    meanCount: 1,
    stdevCount: 0,
    counts: [],
  };
}
