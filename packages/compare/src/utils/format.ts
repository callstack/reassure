import { buildRegExp, digit, repeat } from 'ts-regex-builder';
import type { CompareEntry, PerformanceMetadata } from '../types';

/**
 * Utility functions used for formatting data into strings
 */
export function formatPercent(value: number): string {
  const valueAsPercent = value * 100;
  return `${valueAsPercent.toFixed(1)}%`;
}

export function formatPercentChange(value: number): string {
  const absValue = Math.abs(value);

  // Round to zero
  if (absValue < 0.005) return `±0.0%`;

  return `${value >= 0 ? '+' : '-'}${formatPercent(absValue)}`;
}

export function formatDuration(duration: number): string {
  return `${duration.toFixed(1)} ms`;
}

export function formatDurationDiff(value: number): string {
  if (value > 0) {
    return `+${formatDuration(value)}`;
  }
  if (value < 0) {
    return `${formatDuration(value)}`;
  }
  return '0 ms';
}

export function formatCount(value: number) {
  return Number.isInteger(value) ? `${value}` : `${value.toFixed(2)}`;
}
export function formatCountDiff(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return '±0';
}

export function formatChange(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return '0';
}

export function formatDurationChange(entry: CompareEntry) {
  const { baseline, current } = entry;

  let output = `${formatDuration(baseline.meanDuration)} → ${formatDuration(current.meanDuration)}`;

  if (baseline.meanDuration != current.meanDuration) {
    output += ` (${formatDurationDiff(entry.durationDiff)}, ${formatPercentChange(entry.relativeDurationDiff)})`;
  }

  output += ` ${getDurationChangeSymbols(entry)}`;

  return output;
}

function getDurationChangeSymbols(entry: CompareEntry) {
  if (!entry.isDurationDiffSignificant) {
    if (entry.relativeDurationDiff > 0.15) return '🔴';
    if (entry.relativeDurationDiff < -0.15) return '🟢';
    return '';
  }

  if (entry.relativeDurationDiff > 0.33) return '🔴🔴';
  if (entry.relativeDurationDiff > 0.05) return '🔴';
  if (entry.relativeDurationDiff < -0.33) return '🟢🟢';
  if (entry.relativeDurationDiff < -0.05) return ' 🟢';

  return '';
}

export function formatCountChange(entry: CompareEntry) {
  const { baseline, current } = entry;

  let output = `${formatCount(baseline.meanCount)} → ${formatCount(current.meanCount)}`;

  if (baseline.meanCount != current.meanCount) {
    output += ` (${formatCountDiff(entry.countDiff)}, ${formatPercentChange(entry.relativeCountDiff)})`;
  }

  output += ` ${getCountChangeSymbols(entry)}`;

  return output;
}

function getCountChangeSymbols(entry: CompareEntry) {
  if (entry.countDiff > 1.5) return '🔴🔴';
  if (entry.countDiff > 0.5) return '🔴';
  if (entry.countDiff < -1.5) return '🟢🟢';
  if (entry.countDiff < -0.5) return '🟢';

  return '';
}

function formatCommitMetadata(metadata?: PerformanceMetadata) {
  if (metadata?.branch && metadata?.commitHash) {
    return `${metadata.branch} (${metadata.commitHash})`;
  }

  return metadata?.branch || metadata?.commitHash || '(unknown)';
}

const isoDateMilliseconds = buildRegExp(['.', repeat(digit, 3), 'Z']);

function formatDateTime(dateString: string) {
  // Remove 'T' and milliseconds part
  return dateString.replace('T', ' ').replace(isoDateMilliseconds, 'Z');
}

export function formatMetadata(metadata?: PerformanceMetadata) {
  let result = formatCommitMetadata(metadata);
  if (metadata?.creationDate) {
    result += ` - ${formatDateTime(metadata.creationDate)}`;
  }

  return result;
}
