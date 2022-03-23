import type { CompareEntry } from 'src/compare/types';

/**
 * Utility functions used for formatting data into strings
 */
export function formatPercentChange(value: number): string {
  if (value >= 0.05) return `+${value.toFixed(1)}%`;
  if (value <= -0.05) return `${value.toFixed(1)}%`;
  return `±${value.toFixed(1)}%`;
}

export function formatDuration(duration: number): string {
  return `${duration.toFixed(1)} ms`;
}

export function formatDurationChange(value: number): string {
  if (value > 0) {
    return `+${formatDuration(value)}`;
  }
  if (value < 0) {
    return `${formatDuration(value)}`;
  }
  return '0 ms';
}

export function formatCount(value: number) {
  return value;
}
export function formatCountChange(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return '±0';
}

export function formatChange(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return '0';
}

export function formatRenderDurationChange(item: CompareEntry) {
  const { baseline, current } = item;

  let output = `${formatDuration(baseline.meanDuration)} → ${formatDuration(current.meanDuration)}`;

  if (baseline.meanDuration != current.meanDuration) {
    output += ` (${formatDurationChange(item.durationDiff)}, ${formatPercentChange(item.durationDiffPercent)})`;
  }

  if (current.meanDuration > baseline.meanDuration) output += ' 🔴';
  if (baseline.meanDuration > current.meanDuration) output += ' 🟢';

  return output;
}

export function formatRenderCountChange(item: CompareEntry) {
  const { baseline, current } = item;

  let output = `${formatCount(baseline.meanCount)} → ${formatCount(current.meanCount)}`;

  if (baseline.meanCount != current.meanCount) {
    output += ` (${formatCountChange(item.countDiff)}, ${formatPercentChange(item.countDiffPercent)})`;
  }

  if (current.meanCount > baseline.meanCount) output += ' 🔴';
  if (baseline.meanCount > current.meanCount) output += ' 🟢';

  return output;
}
