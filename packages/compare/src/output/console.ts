import * as logger from '@callstack/reassure-logger';
import type { AddedEntry, CompareResult, CompareEntry, RemovedEntry } from '../types';
import { formatCount, formatDuration, formatMetadata, formatCountChange, formatDurationChange } from '../utils/format';
import type { PerformanceMetadata } from '../types';

export function printToConsole(data: CompareResult) {
  // No need to log errors or warnings as these were be logged on the fly

  logger.log('❇️  Performance comparison results:');
  printMetadata('Current', data.metadata.current);
  printMetadata('Baseline', data.metadata.baseline);

  logger.log('\n➡️  Significant changes to duration');
  data.significant.forEach(printRegularLine);

  logger.log('\n➡️  Meaningless changes to duration');
  data.meaningless.forEach(printRegularLine);

  logger.log('\n➡️  Count changes');
  data.countChanged.forEach(printRegularLine);

  logger.log('\n➡️  Added scenarios');
  data.added.forEach(printAddedLine);

  logger.log('\n➡️  Removed scenarios');
  data.removed.forEach(printRemovedLine);

  logger.newLine();
}

function printMetadata(name: string, metadata?: PerformanceMetadata) {
  logger.log(` - ${name}: ${formatMetadata(metadata)}`);
}

function printRegularLine(entry: CompareEntry) {
  logger.log(` - ${entry.name} [${entry.type}]: ${formatDurationChange(entry)} | ${formatCountChange(entry)}`);
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
