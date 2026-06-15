import type { MeasureEntry, MeasureResults, RunStability, StabilityEntry } from '../types';

export function calculateRunStability(results: MeasureResults): RunStability {
  const entries = Object.values(results.entries).map(calculateStabilityEntry).filter(isStabilityEntry);

  const totalMeanDuration = entries.reduce((sum, entry) => sum + entry.meanDuration, 0);
  const weightedCVSum = entries.reduce((sum, entry) => sum + entry.cv * entry.meanDuration, 0);
  const worstEntry = entries.reduce<StabilityEntry | undefined>((worst, entry) => {
    if (worst == null || entry.cv > worst.cv) return entry;
    return worst;
  }, undefined);

  return {
    weightedAverageCV: totalMeanDuration > 0 ? weightedCVSum / totalMeanDuration : 0,
    worstEntry,
  };
}

function calculateStabilityEntry(entry: MeasureEntry): StabilityEntry | undefined {
  if (entry.meanDuration <= 0) return undefined;

  return {
    name: entry.name,
    cv: entry.stdevDuration / entry.meanDuration,
    meanDuration: entry.meanDuration,
    stdevDuration: entry.stdevDuration,
  };
}

function isStabilityEntry(entry: StabilityEntry | undefined): entry is StabilityEntry {
  return entry != null;
}
