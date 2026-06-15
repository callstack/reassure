import type { EntryStability, MeasureEntry, MeasureResults, RunStability } from '../types';

export function calculateRunStability(results: MeasureResults): RunStability {
  const entries = Object.values(results.entries)
    .map((entry) => {
      const cv = calculateEntryCV(entry);
      if (cv == null) return undefined;

      return {
        cv,
        meanDuration: entry.meanDuration,
      };
    })
    .filter(isStabilityEntry);

  const totalMeanDuration = entries.reduce((sum, entry) => sum + entry.meanDuration, 0);
  const weightedCVSum = entries.reduce((sum, entry) => sum + entry.cv * entry.meanDuration, 0);

  return {
    weightedAverageCV: totalMeanDuration > 0 ? weightedCVSum / totalMeanDuration : 0,
  };
}

export function calculateEntryCV(entry: MeasureEntry): number | undefined {
  if (entry.meanDuration <= 0) return undefined;

  return entry.stdevDuration / entry.meanDuration;
}

export function calculateEntryStability(current?: MeasureEntry, baseline?: MeasureEntry): EntryStability {
  const currentCV = current ? calculateEntryCV(current) : undefined;
  const baselineCV = baseline ? calculateEntryCV(baseline) : undefined;

  return {
    currentCV,
    baselineCV,
    cvDiff: currentCV != null && baselineCV != null ? currentCV - baselineCV : undefined,
  };
}

function isStabilityEntry(entry: { cv: number; meanDuration: number } | undefined): entry is {
  cv: number;
  meanDuration: number;
} {
  return entry != null;
}
