import {
  formatCount,
  formatCountChange,
  formatDuration,
  formatDurationChange,
  formatPercentChange,
} from '../utils/format';
import type {
  ComparisonAddedResult,
  ComparisonOutput,
  ComparisonRegularResult,
  ComparisonRemovedResult,
} from './types';

export function printToConsole(output: ComparisonOutput) {
  console.log('⏱  Performance Comparison Results ⏱');

  console.log('\n➡️  Signficant changes to render duration');
  output.significant.forEach(printRegularLine);

  console.log('\n➡️  Insignficant changes to render duration');
  output.insignificant.forEach(printRegularLine);

  console.log('\n➡️  Meaningless changes to render duration');
  output.meaningless.forEach(printRegularLine);

  console.log('\n➡️  Render count changes');
  output.countChanged.forEach(printRegularLine);

  console.log('\n➡️  Added scenarios');
  output.added.forEach(printAddedLine);

  console.log('\n➡️  Removed scenarios');
  output.removed.forEach(printRemovedLine);

  console.log('\n');
}

function printRegularLine(item: ComparisonRegularResult) {
  const { baseline, current } = item;

  let output = ` - ${item.name}:`;

  output += ` ${formatDuration(baseline.meanDuration)} => ${formatDuration(current.meanDuration)}`;
  if (baseline.meanDuration != current.meanDuration) {
    output += ` (${formatDurationChange(item.durationDiff)}, ${formatPercentChange(item.durationDiffPercent)})`;
  }

  output += ` | ${formatCount(item.baseline.meanCount)} => ${formatCount(item.current.meanCount)}`;
  if (baseline.meanCount != current.meanCount) {
    output += ` (${formatCountChange(item.countDiff)}, ${formatPercentChange(item.countDiffPercent)})`;
  }

  console.log(output);
}

function printAddedLine(item: ComparisonAddedResult) {
  const { current } = item;

  let output = ` - ${item.name}: ${formatDuration(current.meanDuration)} | ${formatCount(current.meanCount)}`;
  console.log(output);
}

function printRemovedLine(item: ComparisonRemovedResult) {
  const { baseline } = item;

  let output = ` - ${item.name}: ${formatDuration(baseline.meanDuration)} | ${formatCount(baseline.meanCount)}`;
  console.log(output);
}
