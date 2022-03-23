import * as fs from 'fs/promises';
import * as path from 'path';
//@ts-ignore
import { headers, emphasis } from 'markdown-builder';
import { formatCount, formatDuration, formatRenderCountChange, formatRenderDurationChange } from '../utils/format';
import { markdownTable } from '../utils/markdown-table';
import type { CompareResult } from './types';

const HEADER = ['Name', 'Render Duration', 'Render Count'] as const;

export const writeToMarkdown = async (filePath: string, data: CompareResult) => {
  try {
    const markdown = buildMarkdown(data);
    writeToFile(filePath, markdown);
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

function buildMarkdown(data: CompareResult) {
  let result = headers.h1('Performance Comparison Results');

  result += `\n\n${headers.h3('Significant Changes To Render Duration')}\n`;
  if (data.significant.length > 0) {
    let rows = data.significant.map((item) => [
      item.name,
      emphasis.b(formatRenderDurationChange(item)),
      formatRenderCountChange(item),
    ]);
    result += markdownTable([HEADER, ...rows]);
  } else {
    result += emphasis.i('There are no significant changes');
  }

  result += `\n\n${headers.h3('Insignificant Changes To Render Duration')}\n`;
  if (data.insignificant.length > 0) {
    let rows = data.insignificant.map((item) => [
      item.name,
      formatRenderDurationChange(item),
      formatRenderCountChange(item),
    ]);
    result += markdownTable([HEADER, ...rows]);
  } else {
    result += emphasis.i('There are no insignificant changes');
  }

  result += `\n\n${headers.h3('Meaningless Changes To Render Duration')}\n`;
  if (data.meaningless.length > 0) {
    let rows = data.meaningless.map((item) => [
      item.name,
      formatRenderDurationChange(item),
      formatRenderCountChange(item),
    ]);
    result += markdownTable([HEADER, ...rows]);
  } else {
    result += emphasis.i('There are no meaningless changes');
  }

  result += `\n\n${headers.h3('Changes To Render Count')}\n`;
  if (data.countChanged.length > 0) {
    let rows = data.countChanged.map((item) => [
      item.name,
      formatRenderDurationChange(item),
      emphasis.b(formatRenderCountChange(item)),
    ]);
    result += markdownTable([HEADER, ...rows]);
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
    result += markdownTable([HEADER, ...rows]);
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
    result += markdownTable([HEADER, ...rows]);
  } else {
    result += emphasis.i('There are no removed scenarios');
  }

  result += '\n';
  return result;
}

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
