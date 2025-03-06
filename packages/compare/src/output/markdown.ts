import * as fs from 'fs/promises';
import * as path from 'path';
import * as md from 'ts-markdown-builder';
import * as logger from '@callstack/reassure-logger';
import {
  formatCount,
  formatDuration,
  formatMetadata,
  formatPercent,
  formatCountChange,
  formatDurationChange,
} from '../utils/format';
import { joinLines } from '../utils/markdown';
import type { AddedEntry, CompareEntry, CompareResult, RemovedEntry, MeasureEntry, RenderIssues } from '../types';

const tableHeader = ['Name', 'Type', 'Duration', 'Count'];

export async function writeToMarkdown(filePath: string, data: CompareResult) {
  try {
    const markdown = buildMarkdown(data);
    await writeToFile(filePath, markdown);
  } catch (error: any) {
    logger.error(error);
    throw error;
  }
}

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
  let doc = [
    md.heading('Performance Comparison Report', { level: 1 }),
    md.list([
      `${md.bold('Current')}: ${formatMetadata(data.metadata.current)}`,
      `${md.bold('Baseline')}: ${formatMetadata(data.metadata.baseline)}`,
    ]),
  ];

  if (data.errors?.length) {
    doc = [
      ...doc, //
      md.heading('Errors', { level: 2 }),
      md.list(data.errors.map((text) => `🛑 ${text}`)),
    ];
  }

  if (data.warnings?.length) {
    doc = [
      ...doc, //
      md.heading('Warnings', { level: 2 }),
      md.list(data.warnings.map((text) => `🟡 ${text}`)),
    ];
  }

  doc = [
    ...doc,
    md.heading('Significant Changes To Duration', { level: 3 }),
    buildSummaryTable(data.significant),
    buildDetailsTable(data.significant),
    md.heading('Meaningless Changes To Duration', { level: 3 }),
    buildSummaryTable(data.meaningless, { open: false }),
    buildDetailsTable(data.meaningless),
  ];

  // Skip renders counts if user only has function measurements
  const allEntries = [...data.significant, ...data.meaningless, ...data.added, ...data.removed];
  const hasRenderEntries = allEntries.some((e) => e.type === 'render');
  if (hasRenderEntries) {
    doc = [
      ...doc,
      md.heading('Render Count Changes', { level: 3 }),
      buildSummaryTable(data.countChanged),
      buildDetailsTable(data.countChanged),
      md.heading('Render Issues', { level: 3 }),
      buildRenderIssuesTable(data.renderIssues),
    ];
  }

  doc = [
    ...doc,
    md.heading('Added Entries', { level: 3 }),
    buildSummaryTable(data.added),
    buildDetailsTable(data.added),
    md.heading('Removed Entries', { level: 3 }),
    buildSummaryTable(data.removed),
    buildDetailsTable(data.removed),
  ];

  return md.joinBlocks(doc);
}

function buildSummaryTable(entries: Array<CompareEntry | AddedEntry | RemovedEntry>, options?: { open?: boolean }) {
  if (!entries.length) return md.italic('There are no entries');

  const open = options?.open ?? true;

  const rows = entries.map((entry) => [
    md.escape(entry.name),
    md.escape(entry.type),
    formatEntryDuration(entry),
    formatEntryCount(entry),
  ]);
  const tableContent = md.table(tableHeader, rows);
  return md.disclosure('Show entries', tableContent, { open });
}

function buildDetailsTable(entries: Array<CompareEntry | AddedEntry | RemovedEntry>) {
  if (!entries.length) return '';

  const rows = entries.map((entry) => [
    md.escape(entry.name),
    md.escape(entry.type),
    buildDurationDetailsEntry(entry),
    buildCountDetailsEntry(entry),
  ]);

  return md.disclosure('Show details', md.table(tableHeader, rows));
}

function formatEntryDuration(entry: CompareEntry | AddedEntry | RemovedEntry) {
  if (entry.baseline != null && entry.current != null) return formatDurationChange(entry);
  if (entry.baseline != null) return formatDuration(entry.baseline.meanDuration);
  if (entry.current != null) return formatDuration(entry.current.meanDuration);
  return '';
}

function formatEntryCount(entry: CompareEntry | AddedEntry | RemovedEntry) {
  if (entry.baseline != null && entry.current != null)
    return formatCountChange(entry.current.meanCount, entry.baseline.meanCount);
  if (entry.baseline != null) return formatCount(entry.baseline.meanCount);
  if (entry.current != null) return formatCount(entry.current.meanCount);
  return '';
}

function buildDurationDetailsEntry(entry: CompareEntry | AddedEntry | RemovedEntry) {
  return md.joinBlocks([
    entry.baseline != null ? buildDurationDetails('Baseline', entry.baseline) : '',
    entry.current != null ? buildDurationDetails('Current', entry.current) : '',
  ]);
}

function buildCountDetailsEntry(entry: CompareEntry | AddedEntry | RemovedEntry) {
  return md.joinBlocks([
    entry.baseline != null ? buildCountDetails('Baseline', entry.baseline) : '',
    entry.current != null ? buildCountDetails('Current', entry.current) : '',
  ]);
}

function buildDurationDetails(title: string, entry: MeasureEntry) {
  const relativeStdev = entry.stdevDuration / entry.meanDuration;

  return joinLines([
    md.bold(title),
    `Mean: ${formatDuration(entry.meanDuration)}`,
    `Stdev: ${formatDuration(entry.stdevDuration)} (${formatPercent(relativeStdev)})`,
    entry.durations ? `Runs: ${formatRunDurations(entry.durations)}` : '',
    entry.warmupDurations ? `Warmup runs: ${formatRunDurations(entry.warmupDurations)}` : '',
    entry.outlierDurations ? `Outliers: ${formatRunDurations(entry.outlierDurations)}` : '',
  ]);
}

function buildCountDetails(title: string, entry: MeasureEntry) {
  const relativeStdev = entry.stdevCount / entry.meanCount;

  return joinLines([
    md.bold(title),
    `Mean: ${formatCount(entry.meanCount)}`,
    `Stdev: ${formatCount(entry.stdevCount)} (${formatPercent(relativeStdev)})`,
    entry.counts ? `Runs: ${entry.counts.map(formatCount).join(' ')}` : '',
    buildRenderIssuesList(entry.issues),
  ]);
}

function formatRunDurations(values: number[]) {
  return values.map((v) => (Number.isInteger(v) ? `${v}` : `${v.toFixed(1)}`)).join(' ');
}

function buildRenderIssuesTable(entries: Array<CompareEntry | AddedEntry>) {
  if (!entries.length) return md.italic('There are no entries');

  const tableHeader = ['Name', 'Initial Updates', 'Redundant Updates'];
  const rows = entries.map((entry) => [
    md.escape(entry.name),
    formatInitialUpdates(entry.current.issues?.initialUpdateCount),
    formatRedundantUpdates(entry.current.issues?.redundantUpdates),
  ]);

  return md.table(tableHeader, rows);
}

function buildRenderIssuesList(issues: RenderIssues | undefined) {
  if (issues == null) return '';

  const output = ['Render issues:'];
  if (issues?.initialUpdateCount) {
    output.push(`- Initial updates: ${formatInitialUpdates(issues.initialUpdateCount, false)}`);
  }
  if (issues?.redundantUpdates?.length) {
    output.push(`- Redundant updates: ${formatRedundantUpdates(issues.redundantUpdates, false)}`);
  }

  return output.join('\n');
}

function formatInitialUpdates(count: number | undefined, showSymbol: boolean = true) {
  if (count == null) return '?';
  if (count === 0) return '-';

  return `${count}${showSymbol ? ' 🔴' : ''}`;
}

function formatRedundantUpdates(redundantUpdates: number[] | undefined, showSymbol: boolean = true) {
  if (redundantUpdates == null) return '?';
  if (redundantUpdates.length === 0) return '-';

  return `${redundantUpdates.length} (${redundantUpdates.join(', ')})${showSymbol ? ' 🔴' : ''}`;
}
