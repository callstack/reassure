import * as logger from '@callstack/reassure-logger';
import type { AddedEntry, CompareResult, CompareEntry, RemovedEntry } from '../types';
import { formatCount, formatDuration, formatMetadata, formatCountChange, formatDurationChange } from '../utils/format';
import type { MeasureMetadata } from '../types';

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

  logger.log('\n➡️  Redundant Renders');
  data.redundantRenderChanged.forEach(printRegularLineRender);

  logger.log('\n➡️  Added scenarios');
  data.added.forEach(printAddedLine);

  logger.log('\n➡️  Removed scenarios');
  data.removed.forEach(printRemovedLine);

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

function printRegularLineRender(entry: CompareEntry) {
  const shouldShowInitial =
    entry.baseline.redundantRenders?.initialRenders !== entry.current.redundantRenders?.initialRenders;
  const shouldShowUpdate = entry.baseline.redundantRenders?.updates !== entry.current.redundantRenders?.updates;

  shouldShowInitial &&
    logger.log(
      ` - ${entry.name} [Initial]: | ${formatCountChange(
        entry.current.redundantRenders?.initialRenders,
        entry.baseline.redundantRenders?.initialRenders
      )}`
    );
  shouldShowUpdate &&
    logger.log(
      ` - ${entry.name} [Update]: | ${formatCountChange(
        entry.current.redundantRenders?.updates,
        entry.baseline.redundantRenders?.updates
      )}`
    );
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
