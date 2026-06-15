import * as math from 'mathjs';
import type { EntryStability, MeasureEntry, MeasureResults, RunStability } from '../types';

export function calculateRunStability(results: MeasureResults): RunStability {
  const entries = Object.values(results.entries)
    .map((entry) => {
      const stability = calculateEntryStabilityStats(entry);
      if (stability == null) return undefined;

      return {
        value: stability.value,
        meanDuration: stability.meanDuration,
      };
    })
    .filter(isStabilityEntry);

  const totalMeanDuration = entries.reduce((sum, entry) => sum + entry.meanDuration, 0);
  const weightedStabilitySum = entries.reduce((sum, entry) => sum + entry.value * entry.meanDuration, 0);

  return {
    weightedAverage: totalMeanDuration > 0 ? weightedStabilitySum / totalMeanDuration : 0,
  };
}

function calculateEntryStabilityStats(entry: MeasureEntry) {
  const durations = [...entry.durations, ...(entry.outlierDurations ?? [])];
  if (durations.length === 0) return undefined;

  const meanDuration = math.mean(...durations) as number;
  if (meanDuration <= 0) return undefined;

  return {
    meanDuration,
    value: math.std(...durations) / meanDuration,
  };
}

export function calculateEntryStability(current?: MeasureEntry, baseline?: MeasureEntry): EntryStability {
  return {
    current: current ? calculateEntryStabilityStats(current)?.value : undefined,
    baseline: baseline ? calculateEntryStabilityStats(baseline)?.value : undefined,
  };
}

function isStabilityEntry(entry: { value: number; meanDuration: number } | undefined): entry is {
  value: number;
  meanDuration: number;
} {
  return entry != null;
}
