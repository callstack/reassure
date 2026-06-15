import * as math from 'mathjs';
import type { EntryStability, MeasureEntry, MeasureResults, RunStability } from '../types';

export function calculateRunStability(results: MeasureResults): RunStability {
  const stability = Object.values(results.entries).reduce(
    (acc, entry) => {
      const entryStability = calculateEntryStabilityStats(entry);
      if (entryStability == null) return acc;

      return {
        totalMeanDuration: acc.totalMeanDuration + entryStability.meanDuration,
        weightedStabilitySum: acc.weightedStabilitySum + entryStability.value * entryStability.meanDuration,
      };
    },
    { totalMeanDuration: 0, weightedStabilitySum: 0 }
  );

  return {
    weightedAverage: stability.totalMeanDuration > 0 ? stability.weightedStabilitySum / stability.totalMeanDuration : 0,
  };
}

function calculateEntryStabilityStats(entry: MeasureEntry) {
  const durations = [...entry.durations, ...(entry.outlierDurations ?? [])];
  if (durations.length === 0) return undefined;

  const meanDuration = math.mean(durations) as number;
  if (meanDuration <= 0) return undefined;

  return {
    meanDuration,
    value: (math.std(durations) as number) / meanDuration,
  };
}

export function calculateEntryStability(current?: MeasureEntry, baseline?: MeasureEntry): EntryStability {
  return {
    current: current ? calculateEntryStabilityStats(current)?.value : undefined,
    baseline: baseline ? calculateEntryStabilityStats(baseline)?.value : undefined,
  };
}
