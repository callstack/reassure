import * as logger from '@callstack/reassure-logger';
import type { AddedEntry, CompareResult, CompareEntry, RemovedEntry } from '../types';
import { formatCount, formatDuration, formatMetadata, formatCountChange, formatDurationChange } from '../utils/format';
import type { MeasureMetadata } from '../types';

export function printToConsole(data: CompareResult) {
  // No need to log errors or warnings as these were be logged on the fly

  logger.log('❇️  Performance comparison results:');
  printMetadata('Current', data.metadata.current);
  printMetadata('Baseline', data.metadata.baseline);

  logger.log('\n➡️  Significant changes to duration (duration | count)');
  data.significant.forEach(printRegularLine);
  if (data.significant.length === 0) {
    logger.log(' - (none)');
  }

  logger.log('\n➡️  Meaningless changes to duration (duration | count)');
  data.meaningless.forEach(printRegularLine);
  if (data.meaningless.length === 0) {
    logger.log(' - (none)');
  }

  logger.log('\n➡️  Render count changes (duration | count)');
  data.countChanged.forEach(printRegularLine);
  if (data.countChanged.length === 0) {
    logger.log(' - (none)');
  }

  logger.log('\n➡️  Redundant Render (Initial | Updates)');
  data.redundantRenders.forEach(printRenderLine);
  if (data.redundantRenders.length === 0) {
    logger.log(' - (none)');
  }

  logger.log('\n➡️  Added scenarios (duration | count)');
  data.added.forEach(printAddedLine);
  if (data.added.length === 0) {
    logger.log(' - (none)');
  }

  logger.log('\n➡️  Removed scenarios (duration | count)');
  data.removed.forEach(printRemovedLine);
  if (data.removed.length === 0) {
    logger.log(' - (none)');
  }

  logger.newLine();
}

function printMetadata(name: string, metadata?: MeasureMetadata) {
  logger.log(` - ${name}: ${formatMetadata(metadata)}`);
}

function printRegularLine(entry: CompareEntry) {
  logger.log(
    ` - ${entry.name} [${entry.type}]: ${formatDurationChange(entry)} | ${formatCountChange(
      entry.current.meanCount,
      entry.baseline.meanCount
    )}`
  );
}

function printRenderLine(entry: CompareEntry | AddedEntry) {
  if (entry.current.initialRenderCount !== 1 || entry.current.redundantUpdates?.length !== 0) {
    logger.log(
      ` - ${entry.name} [render]: | ${formatCountChange(
        entry.current.initialRenderCount,
        entry.baseline?.initialRenderCount
      )} | ${formatCountChange(entry.current.redundantUpdates?.length, entry.baseline?.redundantUpdates?.length)}`
    );
  }
}

function printAddedLine(entry: AddedEntry) {
  const { current } = entry;
  logger.log(
    ` - ${entry.name} [${entry.type}]: ${formatDuration(current.meanDuration)} | ${formatCount(current.meanCount)}`
  );
}

function printRemovedLine(entry: RemovedEntry) {
  const { baseline } = entry;
  logger.log(
    ` - ${entry.name} [${entry.type}]: ${formatDuration(baseline.meanDuration)} | ${formatCount(baseline.meanCount)}`
  );
}
