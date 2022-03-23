import { formatCount, formatDuration, formatRenderCountChange, formatRenderDurationChange } from '../utils/format';
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
  console.log(` - ${item.name}: ${formatRenderDurationChange(item)} | ${formatRenderCountChange(item)}`);
}

function printAddedLine(item: ComparisonAddedResult) {
  const { current } = item;
  console.log(` - ${item.name}: ${formatDuration(current.meanDuration)} | ${formatCount(current.meanCount)}`);
}

function printRemovedLine(item: ComparisonRemovedResult) {
  const { baseline } = item;
  console.log(` - ${item.name}: ${formatDuration(baseline.meanDuration)} | ${formatCount(baseline.meanCount)}`);
}
