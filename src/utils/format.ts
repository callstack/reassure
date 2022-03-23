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

export function formatRenderDurationChange(entry: CompareEntry) {
  const { baseline, current } = entry;

  let output = `${formatDuration(baseline.meanDuration)} → ${formatDuration(current.meanDuration)}`;

  if (baseline.meanDuration != current.meanDuration) {
    output += ` (${formatDurationChange(entry.durationDiff)}, ${formatPercentChange(entry.durationDiffPercent)})`;
  }

  output += ` ${getRenderDurationSymbols(entry)}`;

  return output;
}

function getRenderDurationSymbols(entry: CompareEntry) {
  if (entry.durationDiffSignificance !== 'SIGNIFICANT') return '';

  if (entry.durationDiffPercent > 50) return '🔴🔴🔴';
  if (entry.durationDiffPercent > 20) return ' 🔴🔴';
  if (entry.durationDiffPercent > 5) return ' 🔴';
  if (entry.durationDiffPercent < -50) return ' 🟢🟢🟢';
  if (entry.durationDiffPercent < -20) return ' 🟢🟢';
  if (entry.durationDiffPercent < -5) return ' 🟢';

  return '';
}

export function formatRenderCountChange(entry: CompareEntry) {
  const { baseline, current } = entry;

  let output = `${formatCount(baseline.meanCount)} → ${formatCount(current.meanCount)}`;

  if (baseline.meanCount != current.meanCount) {
    output += ` (${formatCountChange(entry.countDiff)}, ${formatPercentChange(entry.countDiffPercent)})`;
  }

  output += ` ${getRenderCountSymbols(entry)}`;

  return output;
}

function getRenderCountSymbols(entry: CompareEntry) {
  if (entry.countDiff > 2) return '🔴🔴🔴';
  if (entry.countDiff > 1) return ' 🔴🔴';
  if (entry.countDiff > 0) return ' 🔴';
  if (entry.countDiff < -2) return ' 🟢🟢🟢';
  if (entry.countDiff < -1) return ' 🟢🟢';
  if (entry.countDiff < 0) return ' 🟢';

  return '';
}
