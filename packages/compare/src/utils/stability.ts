import * as math from 'mathjs';
import type { EntryStability, MeasureEntry, MeasureResults, RunStability } from '../types';

export function calculateRunStability(results: MeasureResults): RunStability {
  const entries = Object.values(results.entries)
    .map((entry) => {
      const stats = calculateEntryStabilityStats(entry);
      if (stats == null) return undefined;

      return {
        cv: stats.cv,
        meanDuration: stats.meanDuration,
      };
    })
    .filter(isStabilityEntry);

  const totalMeanDuration = entries.reduce((sum, entry) => sum + entry.meanDuration, 0);
  const weightedCVSum = entries.reduce((sum, entry) => sum + entry.cv * entry.meanDuration, 0);

  return {
    weightedAverage: totalMeanDuration > 0 ? weightedCVSum / totalMeanDuration : 0,
  };
}

export function calculateEntryCV(entry: MeasureEntry): number | undefined {
  return calculateEntryStabilityStats(entry)?.cv;
}

function calculateEntryStabilityStats(entry: MeasureEntry) {
  const durations = [...entry.durations, ...(entry.outlierDurations ?? [])];
  if (durations.length === 0) return undefined;

  const meanDuration = math.mean(...durations) as number;
  if (meanDuration <= 0) return undefined;

  return {
    meanDuration,
    cv: math.std(...durations) / meanDuration,
  };
}

export function calculateEntryStability(current?: MeasureEntry, baseline?: MeasureEntry): EntryStability {
  const currentCV = current ? calculateEntryCV(current) : undefined;
  const baselineCV = baseline ? calculateEntryCV(baseline) : undefined;

  return {
    current: currentCV,
    baseline: baselineCV,
  };
}

function isStabilityEntry(entry: { cv: number; meanDuration: number } | undefined): entry is {
  cv: number;
  meanDuration: number;
} {
  return entry != null;
}
