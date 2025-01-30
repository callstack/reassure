import { buildRegExp, digit, repeat } from 'ts-regex-builder';
import type { CompareEntry, MeasureMetadata } from '../types';

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

export function formatCount(value?: number) {
  if (value == null) {
    return '?';
  }

  return Number.isInteger(value) ? `${value}` : `${value.toFixed(2)}`;
}

export function formatCountDiff(current: number, baseline: number): string {
  const diff = current - baseline;
  if (diff > 0) {
    return `+${formatCount(diff)}`;
  }
  if (diff < 0) {
    return `${formatCount(diff)}`;
  }

  return '±0';
}

export function formatCountChange(current?: number, baseline?: number): string {
  let output = `${formatCount(baseline)} → ${formatCount(current)}`;

  if (baseline != null && current != null && baseline !== current) {
    const parts = [formatCountDiff(current, baseline)];

    if (baseline > 0) {
      const relativeDiff = (current - baseline) / baseline;
      parts.push(formatPercentChange(relativeDiff));
    }

    output += ` (${parts.join(', ')})`;
  }

  output += ` ${getCountChangeSymbols(current, baseline)}`;
  return output;
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

function getCountChangeSymbols(current?: number, baseline?: number) {
  if (current == null || baseline == null) {
    return '';
  }

  const diff = current - baseline;
  if (diff > 1.5) return '🔴🔴';
  if (diff > 0.5) return '🔴';
  if (diff < -1.5) return '🟢🟢';
  if (diff < -0.5) return '🟢';

  return '';
}

function formatCommitMetadata(metadata?: MeasureMetadata) {
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

export function formatMetadata(metadata?: MeasureMetadata) {
  let result = formatCommitMetadata(metadata);
  if (metadata?.creationDate) {
    result += ` - ${formatDateTime(metadata.creationDate)}`;
  }

  return result;
}
