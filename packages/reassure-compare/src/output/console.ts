import type { AddedEntry, CompareResult, CompareEntry, RemovedEntry } from '../types';
import {
  formatCount,
  formatDuration,
  formatMetadata,
  formatRenderCountChange,
  formatRenderDurationChange,
} from '../utils/format';
import type { PerformanceMetadata } from '../types';
import { logger } from '../utils/logger';

export function printToConsole(data: CompareResult) {
  // No need to log errors or warnings as these were be logged on the fly

  logger.log('❇️  Performance comparison results:');
  printMetadata('Current', data.metadata.current);
  printMetadata('Baseline', data.metadata.baseline);

  logger.log('');
  logger.log('➡️  Signficant changes to render duration');
  data.significant.forEach(printRegularLine);

  logger.log('');
  logger.log('➡️  Meaningless changes to render duration');
  data.meaningless.forEach(printRegularLine);

  logger.log('');
  logger.log('➡️  Render count changes');
  data.countChanged.forEach(printRegularLine);

  logger.log('');
  logger.log('➡️  Added scenarios');
  data.added.forEach(printAddedLine);

  logger.log('');
  logger.log('➡️  Removed scenarios');
  data.removed.forEach(printRemovedLine);

  logger.log('');
}

function printMetadata(name: string, metadata?: PerformanceMetadata) {
  logger.log(` - ${name}: ${formatMetadata(metadata)}`);
}

function printRegularLine(entry: CompareEntry) {
  logger.log(` - ${entry.name}: ${formatRenderDurationChange(entry)} | ${formatRenderCountChange(entry)}`);
}

function printAddedLine(entry: AddedEntry) {
  const { current } = entry;
  logger.log(` - ${entry.name}: ${formatDuration(current.meanDuration)} | ${formatCount(current.meanCount)}`);
}

function printRemovedLine(entry: RemovedEntry) {
  const { baseline } = entry;
  logger.log(` - ${entry.name}: ${formatDuration(baseline.meanDuration)} | ${formatCount(baseline.meanCount)}`);
}
