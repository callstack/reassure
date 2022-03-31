import * as fs from 'fs/promises';
import * as path from 'path';
// @ts-ignore
import { headers, emphasis } from 'markdown-builder';
// @ts-ignore
import markdownTable from 'markdown-table';
import { formatCount, formatDuration, formatRenderCountChange, formatRenderDurationChange } from '../utils/format';
import { expandableSection } from '../utils/markdown';
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
  let result = headers.h1('Performance Comparison Results');

  result += `\n\n${headers.h3('Significant Changes To Render Duration')}\n`;
  if (data.significant.length > 0) {
    let rows = data.significant.map((item) => [item.name, buildDurationSection(item), buildCountSection(item)]);
    result += markdownTable([tableHeader, ...rows], tableOptions);
  } else {
    result += emphasis.i('There are no significant changes');
  }

  result += `\n\n${headers.h3('Insignificant Changes To Render Duration')}\n`;
  if (data.insignificant.length > 0) {
    let rows = data.insignificant.map((item) => [item.name, buildDurationSection(item), buildCountSection(item)]);
    result += markdownTable([tableHeader, ...rows], tableOptions);
  } else {
    result += emphasis.i('There are no insignificant changes');
  }

  result += `\n\n${headers.h3('Meaningless Changes To Render Duration')}\n`;
  if (data.meaningless.length > 0) {
    let rows = data.meaningless.map((item) => [item.name, buildDurationSection(item), buildCountSection(item)]);
    result += markdownTable([tableHeader, ...rows], tableOptions);
  } else {
    result += emphasis.i('There are no meaningless changes');
  }

  result += `\n\n${headers.h3('Changes To Render Count')}\n`;
  if (data.countChanged.length > 0) {
    let rows = data.countChanged.map((item) => [item.name, buildDurationSection(item), buildCountSection(item)]);
    result += markdownTable([tableHeader, ...rows], tableOptions);
  } else {
    result += emphasis.i('There are no render count changes');
  }

  result += `\n\n${headers.h3('Added Scenarios')}\n`;
  if (data.added.length > 0) {
    let rows = data.added.map((item) => [
      item.name,
      formatDuration(item.current.meanDuration),
      formatCount(item.current.meanCount),
    ]);
    result += markdownTable([tableHeader, ...rows], tableOptions);
  } else {
    result += emphasis.i('There are no added scenarios');
  }

  result += `\n\n${headers.h3('Removed Scenarios')}\n`;
  if (data.removed.length > 0) {
    let rows = data.removed.map((item) => [
      item.name,
      formatDuration(item.baseline.meanDuration),
      formatCount(item.baseline.meanCount),
    ]);
    result += markdownTable([tableHeader, ...rows], tableOptions);
  } else {
    result += emphasis.i('There are no removed scenarios');
  }

  if (data.errors?.length) {
    result += `\n${headers.h3('Errors')}\n`;
    data.errors.forEach((message) => {
      result += ` 1. 🛑 ${message}\n`;
    });
  }

  if (data.warnings?.length) {
    result += `\n${headers.h3('Warnings')}\n`;
    data.warnings.forEach((message) => {
      result += ` 1. 🟡 ${message}\n`;
    });
  }

  result += '\n';

  return result;
}

function buildDurationSection(entry: CompareEntry | AddedEntry | RemovedEntry) {
  if ('baseline' in entry && 'current' in entry && entry.baseline.durations && entry.current.durations) {
    return `${formatRenderDurationChange(entry)}\n\n
    ${expandableSection(
      'Show details',
      `${buildDurationDetails('Baseline', entry.baseline)}${buildDurationDetails('Current', entry.current)}}`
    )}`;
  }

  if (`baseline` in entry && entry.baseline.durations) {
    return `${formatDuration(entry.baseline.meanDuration)}\n\n
    ${expandableSection('Show details', buildDurationDetails('Baseline', entry.baseline))}`;
  }

  if (`current` in entry && entry.current.durations) {
    return `${formatDuration(entry.current.meanDuration)}\n\n
    ${expandableSection('Show details', buildDurationDetails('Current', entry.current))}`;
  }

  return '';
}

function buildCountSection(entry: CompareEntry | AddedEntry | RemovedEntry) {
  if ('baseline' in entry && 'current' in entry && entry.baseline.counts && entry.current.counts) {
    return `${formatRenderCountChange(entry)}\n\n
    ${expandableSection(
      'Show details',
      `${buildCountDetails('Baseline', entry.baseline)}${buildCountDetails('Current', entry.current)}}`
    )}`;
  }

  if (`baseline` in entry && entry.baseline.counts) {
    return `${formatCount(entry.baseline.meanCount)}\n\n
    ${expandableSection('Show details', buildCountDetails('Baseline', entry.baseline))}`;
  }

  if (`current` in entry && entry.current.counts) {
    return `${formatCount(entry.current.meanCount)}\n\n
    ${expandableSection('Show details', buildCountDetails('Current', entry.current))}`;
  }

  return '';
}

function buildDurationDetails(title: string, entry: PerformanceEntry) {
  return `${headers.h3(title)}\n\n
    Stdev: ${formatDuration(entry.stdevDuration)}\n\n
    ${entry.durations.map(formatDuration).join('\n')}\n\n`;
}

function buildCountDetails(title: string, entry: PerformanceEntry) {
  return `${headers.h3(title)}\n\n
    Stdev: ${formatCount(entry.stdevCount)}\n\n
    ${entry.counts.map(formatCount).join('\n')}\n\n`;
}
