import * as fs from 'fs/promises';
import * as path from 'path';
// @ts-ignore
import { headers, emphasis } from 'markdown-builder';
// @ts-ignore
import markdownTable from 'markdown-table';
import { formatCount, formatDuration, formatRenderCountChange, formatRenderDurationChange } from '../utils/format';
import { collapsibleSection } from '../utils/markdown';
import type { PerformanceEntry } from '../measure/types';
import type { AddedEntry, CompareEntry, CompareResult, RemovedEntry } from './types';

const tableHeader = ['Name', 'Render Duration', 'Render Count'] as const;
const tableOptions = { align: ['l', 'r', 'r'] } as const;

export const writeToMarkdown = async (filePath: string, data: CompareResult) => {
  try {
    const markdown = buildMarkdown(data);
    writeToFile(filePath, markdown);
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

async function writeToFile(filePath: string, content: string) {
  try {
    await fs.writeFile(filePath, content);

    console.log(`✅  Written output markdown output file ${filePath}`);
    console.log(`🔗 ${path.resolve(filePath)}`);
  } catch (error) {
    console.log(`❌  Could not write markdown output file ${filePath}`);
    console.log(`🔗 ${path.resolve(filePath)}`);
    console.error(error);
    throw error;
  }
}

function buildMarkdown(data: CompareResult) {
  let result = headers.h1('Performance Comparison Report');

  if (data.errors?.length) {
    result += `\n\n${headers.h3('Errors')}\n`;
    data.errors.forEach((message) => {
      result += ` 1. 🛑 ${message}\n`;
    });
  }

  if (data.warnings?.length) {
    result += `\n\n${headers.h3('Warnings')}\n`;
    data.warnings.forEach((message) => {
      result += ` 1. 🟡 ${message}\n`;
    });
  }

  result += `\n\n${headers.h3('Significant Changes To Render Duration')}`;
  result += `\n${buildSummaryTable(data.significant)}`;
  result += `\n${buildDetailsTable(data.significant)}`;
  result += `\n\n${headers.h3('Insignificant Changes To Render Duration')}`;
  result += `\n${buildSummaryTable(data.insignificant)}`;
  result += `\n${buildDetailsTable(data.insignificant)}`;
  result += `\n\n${headers.h3('Meaningless Changes To Render Duration')}`;
  result += `\n${buildSummaryTable(data.meaningless)}`;
  result += `\n${buildDetailsTable(data.meaningless)}`;
  result += `\n\n${headers.h3('Changes To Render Count')}`;
  result += `\n${buildSummaryTable(data.countChanged)}`;
  result += `\n${buildDetailsTable(data.countChanged)}`;
  result += `\n\n${headers.h3('Added Scenarios')}`;
  result += `\n${buildSummaryTable(data.added)}`;
  result += `\n${buildDetailsTable(data.added)}`;
  result += `\n\n${headers.h3('Removed Scenarios')}`;
  result += `\n${buildSummaryTable(data.removed)}`;
  result += `\n${buildDetailsTable(data.removed)}`;
  result += '\n';

  return result;
}

function buildSummaryTable(entries: Array<CompareEntry | AddedEntry | RemovedEntry>) {
  if (!entries.length) return emphasis.i('There are no entries');

  const rows = entries.map((entry) => [entry.name, formatEntryDuration(entry), formatEntryCount(entry)]);
  return markdownTable([tableHeader, ...rows], tableOptions);
}

function buildDetailsTable(entries: Array<CompareEntry | AddedEntry | RemovedEntry>) {
  if (!entries.length) return '';

  const rows = entries.map((entry) => [entry.name, buildDurationDetailsEntry(entry), buildCountDetailsEntry(entry)]);
  const content = markdownTable([tableHeader, ...rows]);

  return collapsibleSection('Show details', content);
}

function formatEntryDuration(entry: CompareEntry | AddedEntry | RemovedEntry) {
  if ('baseline' in entry && 'current' in entry) return formatRenderDurationChange(entry);
  if ('baseline' in entry) return formatDuration(entry.baseline.meanDuration);
  if ('current' in entry) return formatDuration(entry.current.meanDuration);
  return '';
}

function formatEntryCount(entry: CompareEntry | AddedEntry | RemovedEntry) {
  if ('baseline' in entry && 'current' in entry) return formatRenderCountChange(entry);
  if ('baseline' in entry) return formatCount(entry.baseline.meanCount);
  if ('current' in entry) return formatCount(entry.current.meanCount);
  return '';
}

function buildDurationDetailsEntry(entry: CompareEntry | AddedEntry | RemovedEntry) {
  return [
    'baseline' in entry ? buildDurationDetails('Baseline', entry.baseline) : '',
    'current' in entry ? buildDurationDetails('Current', entry.current) : '',
  ]
    .filter(Boolean)
    .join('<br/><br/>');
}

function buildCountDetailsEntry(entry: CompareEntry | AddedEntry | RemovedEntry) {
  return [
    'baseline' in entry ? buildCountDetails('Baseline', entry.baseline) : '',
    'current' in entry ? buildCountDetails('Current', entry.current) : '',
  ]
    .filter(Boolean)
    .join('<br/>');
}

function buildDurationDetails(title: string, entry: PerformanceEntry) {
  return [
    emphasis.b(title),
    `Mean: ${formatDuration(entry.meanDuration)}`,
    `Stdev: ${formatDuration(entry.stdevDuration)}`,
    entry.durations ? `Runs:<br/>${entry.durations.map(formatDuration).join('<br/>')}` : '',
  ].join(`<br/>`);
}

function buildCountDetails(title: string, entry: PerformanceEntry) {
  return [
    emphasis.b(title),
    `Mean: ${formatCount(entry.meanCount)}`,
    `Stdev: ${formatCount(entry.stdevCount)}`,
    entry.counts ? `Runs:<br/>${entry.counts.map(formatCount).join('<br/>')}` : '',
  ].join(`<br/>`);
}
