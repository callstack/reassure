import * as fs from 'fs/promises';
import * as path from 'path';
// @ts-ignore
import markdownTable from 'markdown-table';
import * as logger from '@callstack/reassure-logger';
import {
  formatCount,
  formatDuration,
  formatMetadata,
  formatPercent,
  formatCountChange,
  formatDurationChange,
} from '../utils/format';
import * as md from '../utils/markdown';
import type {
  AddedEntry,
  CompareEntry,
  CompareResult,
  RemovedEntry,
  MeasureEntry,
  MeasureMetadata,
  RenderIssue,
} from '../types';
import { collapsibleSection } from '../utils/markdown';

const tableHeader = ['Name', 'Type', 'Duration', 'Count'] as const;

export const writeToMarkdown = async (filePath: string, data: CompareResult) => {
  try {
    const markdown = buildMarkdown(data);
    await writeToFile(filePath, markdown);
  } catch (error: any) {
    logger.error(error);
    throw error;
  }
};

async function writeToFile(filePath: string, content: string) {
  try {
    await fs.writeFile(filePath, content);

    logger.log(`✅  Written output markdown output file ${filePath}`);
    logger.log(`🔗 ${path.resolve(filePath)}\n`);
  } catch (error) {
    logger.error(`❌  Could not write markdown output file ${filePath}`);
    logger.error(`🔗 ${path.resolve(filePath)}`);
    logger.error('Error details:', error);
    throw error;
  }
}

function buildMarkdown(data: CompareResult) {
  let result = md.heading1('Performance Comparison Report');

  result += `\n${buildMetadataMarkdown('Current', data.metadata.current)}`;
  result += `\n${buildMetadataMarkdown('Baseline', data.metadata.baseline)}`;

  if (data.errors?.length) {
    result += `\n\n${md.heading3('Errors')}\n`;
    data.errors.forEach((message) => {
      result += ` 1. 🛑 ${message}\n`;
    });
  }

  if (data.warnings?.length) {
    result += `\n\n${md.heading3('Warnings')}\n`;
    data.warnings.forEach((message) => {
      result += ` 1. 🟡 ${message}\n`;
    });
  }

  result += `\n\n${md.heading3('Significant Changes To Duration')}`;
  result += `\n${buildSummaryTable(data.significant)}`;
  result += `\n${buildDetailsTable(data.significant)}`;
  result += `\n\n${md.heading3('Meaningless Changes To Duration')}`;
  result += `\n${buildSummaryTable(data.meaningless, true)}`;
  result += `\n${buildDetailsTable(data.meaningless)}`;

  // Skip renders counts if user only has function measurements
  const allEntries = [...data.significant, ...data.meaningless, ...data.added, ...data.removed];
  const hasRenderEntries = allEntries.some((e) => e.type === 'render');
  if (hasRenderEntries) {
    result += `\n\n${md.heading3('Render Count Changes')}`;
    result += `\n${buildSummaryTable(data.countChanged)}`;
    result += `\n${buildDetailsTable(data.countChanged)}`;
    result += `\n\n${md.heading3('Render Issues')}`;
    result += `\n${buildRenderIssuesTable(data.renderIssues)}`;
  }

  result += `\n\n${md.heading3('Added Scenarios')}`;
  result += `\n${buildSummaryTable(data.added)}`;
  result += `\n${buildDetailsTable(data.added)}`;
  result += `\n\n${md.heading3('Removed Scenarios')}`;
  result += `\n${buildSummaryTable(data.removed)}`;
  result += `\n${buildDetailsTable(data.removed)}`;
  result += '\n';

  return result;
}

function buildMetadataMarkdown(name: string, metadata: MeasureMetadata | undefined) {
  return ` - ${md.bold(name)}: ${formatMetadata(metadata)}`;
}

function buildSummaryTable(entries: Array<CompareEntry | AddedEntry | RemovedEntry>, collapse: boolean = false) {
  if (!entries.length) return md.italic('There are no entries');

  const rows = entries.map((entry) => [entry.name, entry.type, formatEntryDuration(entry), formatEntryCount(entry)]);
  const content = markdownTable([tableHeader, ...rows]);

  return collapse ? collapsibleSection('Show entries', content) : content;
}

function buildDetailsTable(entries: Array<CompareEntry | AddedEntry | RemovedEntry>) {
  if (!entries.length) return '';

  const rows = entries.map((entry) => [
    entry.name,
    entry.type,
    buildDurationDetailsEntry(entry),
    buildCountDetailsEntry(entry),
  ]);
  const content = markdownTable([tableHeader, ...rows]);

  return collapsibleSection('Show details', content);
}

function formatEntryDuration(entry: CompareEntry | AddedEntry | RemovedEntry) {
  if (entry.baseline != null && 'current' in entry) return formatDurationChange(entry);
  if (entry.baseline != null) return formatDuration(entry.baseline.meanDuration);
  if ('current' in entry) return formatDuration(entry.current.meanDuration);
  return '';
}

function formatEntryCount(entry: CompareEntry | AddedEntry | RemovedEntry) {
  if (entry.baseline != null && 'current' in entry)
    return formatCountChange(entry.current.meanCount, entry.baseline.meanCount);
  if (entry.baseline != null) return formatCount(entry.baseline.meanCount);
  if ('current' in entry) return formatCount(entry.current.meanCount);
  return '';
}

function buildDurationDetailsEntry(entry: CompareEntry | AddedEntry | RemovedEntry) {
  return [
    entry.baseline != null ? buildDurationDetails('Baseline', entry.baseline) : '',
    'current' in entry ? buildDurationDetails('Current', entry.current) : '',
  ]
    .filter(Boolean)
    .join('<br/><br/>');
}

function buildCountDetailsEntry(entry: CompareEntry | AddedEntry | RemovedEntry) {
  return [
    entry.baseline != null ? buildCountDetails('Baseline', entry.baseline) : '',
    'current' in entry ? buildCountDetails('Current', entry.current) : '',
  ]
    .filter(Boolean)
    .join('<br/><br/>');
}

function buildDurationDetails(title: string, entry: MeasureEntry) {
  const relativeStdev = entry.stdevDuration / entry.meanDuration;

  return [
    md.bold(title),
    `Mean: ${formatDuration(entry.meanDuration)}`,
    `Stdev: ${formatDuration(entry.stdevDuration)} (${formatPercent(relativeStdev)})`,
    entry.durations ? `Runs: ${formatRunDurations(entry.durations)}` : '',
    entry.warmupDurations ? `Warmup: ${formatRunDurations(entry.warmupDurations)}` : '',
  ]
    .filter(Boolean)
    .join(`<br/>`);
}

function buildCountDetails(title: string, entry: MeasureEntry) {
  const relativeStdev = entry.stdevCount / entry.meanCount;

  return [
    md.bold(title),
    `Mean: ${formatCount(entry.meanCount)}`,
    `Stdev: ${formatCount(entry.stdevCount)} (${formatPercent(relativeStdev)})`,
    entry.counts ? `Runs: ${entry.counts.map(formatCount).join(' ')}` : '',
    buildRenderIssuesList(entry.issues),
  ]
    .filter(Boolean)
    .join(`<br/>`);
}

function formatRunDurations(values: number[]) {
  return values.map((v) => (Number.isInteger(v) ? `${v}` : `${v.toFixed(1)}`)).join(' ');
}

function buildRenderIssuesTable(entries: Array<CompareEntry | AddedEntry>) {
  if (!entries.length) return md.italic('There are no entries');

  const tableHeader = ['Name', 'Initial Updates', 'Redundant Updates'] as const;
  const rows = entries.map((entry) => [
    entry.name,
    formatInitialUpdates(entry.current.issues?.initialUpdateCount),
    formatRedundantUpdates(entry.current.issues?.redundantUpdates),
  ]);

  return markdownTable([tableHeader, ...rows]);
}

function buildRenderIssuesList(issues: RenderIssue | undefined) {
  if (issues == null) return '';

  const output = [];
  if (issues?.initialUpdateCount) {
    output.push(`* Initial updates: ${formatInitialUpdates(issues.initialUpdateCount)}`);
  }
  if (issues?.redundantUpdates) {
    output.push(`* Redundant updates: ${formatRedundantUpdates(issues.redundantUpdates)}`);
  }

  return output.join('\n');
}

function formatInitialUpdates(count: number | undefined) {
  if (count == null) return '?';
  if (count === 0) return '-';

  return `${count} 🔴`;
}

function formatRedundantUpdates(redundantUpdates: number[] | undefined) {
  if (redundantUpdates == null) return '?';
  if (redundantUpdates.length === 0) return '-';

  return `${redundantUpdates.length} (${redundantUpdates.join(', ')}) 🔴`;
}
