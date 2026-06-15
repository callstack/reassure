import * as logger from '@callstack/reassure-logger';
import type { AddedEntry, CompareResult, CompareEntry, RemovedEntry, RunStability, EntryStability } from '../types';
import {
  formatCount,
  formatDuration,
  formatMetadata,
  formatPercent,
  formatPercentPointDiff,
  formatCountChange,
  formatDurationChange,
} from '../utils/format';
import type { MeasureMetadata } from '../types';

export function printToConsole(data: CompareResult) {
  // No need to log errors or warnings as these were be logged on the fly

  logger.log('❇️  Performance comparison results:');
  printMetadata('Current', data.metadata.current);
  printMetadata('Baseline', data.metadata.baseline);

  logger.log('\n➡️  Significant changes to duration');
  data.significant.forEach(printRegularLine);
  if (data.significant.length === 0) {
    logger.log(' - (none)');
  }

  logger.log('\n➡️  Meaningless changes to duration');
  data.meaningless.forEach(printRegularLine);
  if (data.meaningless.length === 0) {
    logger.log(' - (none)');
  }

  logger.log('\n➡️  Render count changes');
  data.countChanged.forEach(printRegularLine);
  if (data.countChanged.length === 0) {
    logger.log(' - (none)');
  }

  logger.log('\n➡️  Render issues');
  data.renderIssues.forEach(printRenderIssuesLine);
  if (data.renderIssues.length === 0) {
    logger.log(' - (none)');
  }

  logger.log('\n➡️  Added scenarios');
  data.added.forEach(printAddedLine);
  if (data.added.length === 0) {
    logger.log(' - (none)');
  }

  logger.log('\n➡️  Removed scenarios');
  data.removed.forEach(printRemovedLine);
  if (data.removed.length === 0) {
    logger.log(' - (none)');
  }

  logger.log('\n➡️  Stability');
  printStability('Current', data.stability.current);
  if (data.stability.baseline) {
    printStability('Baseline', data.stability.baseline);
    logger.log(` - Change: ${formatPercentPointDiff(data.stability.weightedAverageCVDiff ?? 0)}`);
  }

  logger.newLine();
}

function printMetadata(name: string, metadata?: MeasureMetadata) {
  logger.log(` - ${name}: ${formatMetadata(metadata)}`);
}

function printStability(name: string, stability: RunStability) {
  logger.log(` - ${name}: ${formatPercent(stability.weightedAverageCV)} weighted CV`);
}

function printRegularLine(entry: CompareEntry) {
  logger.log(
    ` - ${entry.name} [${entry.type}]: ${formatDurationChange(entry)} | ${formatCountChange(
      entry.current.meanCount,
      entry.baseline.meanCount
    )} | stability ${formatEntryStability(entry.stability)}`
  );
}

function printRenderIssuesLine(entry: CompareEntry | AddedEntry) {
  const issues = [];

  const initialUpdateCount = entry.current.issues?.initialUpdateCount;
  if (initialUpdateCount) {
    issues.push(formatInitialUpdates(initialUpdateCount));
  }

  const redundantUpdates = entry.current.issues?.redundantUpdates;
  if (redundantUpdates?.length) {
    issues.push(formatRedundantUpdates(redundantUpdates));
  }

  logger.log(` - ${entry.name}: ${issues.join(' | ')}`);
}

function printAddedLine(entry: AddedEntry) {
  const { current } = entry;
  logger.log(
    ` - ${entry.name} [${entry.type}]: ${formatDuration(current.meanDuration)} | ${formatCount(
      current.meanCount
    )} | stability ${formatEntryStability(entry.stability)}`
  );
}

function printRemovedLine(entry: RemovedEntry) {
  const { baseline } = entry;
  logger.log(
    ` - ${entry.name} [${entry.type}]: ${formatDuration(baseline.meanDuration)} | ${formatCount(
      baseline.meanCount
    )} | stability ${formatEntryStability(entry.stability)}`
  );
}

function formatEntryStability(stability: EntryStability) {
  if (stability.baselineCV != null && stability.currentCV != null) {
    return `${formatPercent(stability.baselineCV)} → ${formatPercent(stability.currentCV)} (${formatPercentPointDiff(
      stability.cvDiff ?? 0
    )})`;
  }

  if (stability.currentCV != null) return formatPercent(stability.currentCV);
  if (stability.baselineCV != null) return formatPercent(stability.baselineCV);

  return '?';
}

export function formatInitialUpdates(count: number) {
  if (count === 0) return '-';
  if (count === 1) return '1 initial update 🔴';

  return `${count} initial updates 🔴`;
}

export function formatRedundantUpdates(redundantUpdates: number[]) {
  if (redundantUpdates.length === 0) return '-';
  if (redundantUpdates.length === 1) return `1 redundant update (${redundantUpdates.join(', ')}) 🔴`;

  return `${redundantUpdates.length} redundant updates (${redundantUpdates.join(', ')}) 🔴`;
}
