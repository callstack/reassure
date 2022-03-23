import * as fs from 'fs/promises';
import * as path from 'path';
import minimist from 'minimist';
//@ts-ignore
import { emphasis } from 'markdown-builder';
import { markdownTable } from './markdown-table';
import type { ComparisonOutput, ComparisonRegularResult } from './shared';
import {
  formatChange,
  formatCount,
  formatDuration,
  formatDurationChange,
  formatPercentChange,
} from './utils';

type ScriptArguments = {
  analyserOutputFilePath: string;
  outputMarkdownFilePath: string;
};

const {
  outputMarkdownFilePath = 'analyser-output.md',
  analyserOutputFilePath = 'analyser-output.json',
} = minimist<ScriptArguments>(process.argv);

const COLUMNS = ['Name', 'Status', 'Render Duration', 'Render Count'] as const;

const loadFile = async (path: string): Promise<ComparisonOutput> => {
  const data = await fs.readFile(path, 'utf8');
  return JSON.parse(data);
};

const formatRenderDurationChange = (item: ComparisonRegularResult) => {
  const { durationDiff, durationDiffPercent } = item;

  return `${formatDuration(item.baseline.meanDuration)} -> ${formatDuration(
    item.current.meanDuration
  )}, ${formatDurationChange(durationDiff)}, ${formatPercentChange(
    durationDiffPercent
  )}`;
};

const formatRenderCountChange = (item: ComparisonRegularResult) => {
  const { countDiff, countDiffPercent } = item;
  if (item.baseline.meanCount === item.current.meanCount) {
    return `${item.baseline.meanCount} -> ${item.current.meanCount}`;
  }

  return `${item.baseline.meanCount} -> ${
    item.current.meanCount
  }, ${formatChange(countDiff)}, ${formatPercentChange(countDiffPercent)}`;
};

export const buildMarkdown = async () => {
  try {
    const output = await loadFile(analyserOutputFilePath);

    let content: any[][] = [];

    content = content.concat(
      output.significant.map((item) => [
        item.name,
        emphasis.b('Significant'),
        emphasis.b(formatRenderDurationChange(item)),
        formatRenderCountChange(item),
      ])
    );

    content = content.concat(
      output.insignificant.map((item) => [
        item.name,
        'Insignificant',
        formatRenderDurationChange(item),
        formatRenderCountChange(item),
      ])
    );

    content = content.concat(
      output.meaningless.map((item) => [
        item.name,
        'Meaningless',
        formatRenderDurationChange(item),
        formatRenderCountChange(item),
      ])
    );

    content = content.concat(
      output.countChanged.map((item) => [
        item.name,
        emphasis.b('Render count changed'),
        formatRenderDurationChange(item),
        emphasis.b(formatRenderCountChange(item)),
      ])
    );

    content = content.concat(
      output.added.map((item) => [
        item.name,
        'Added',
        formatDuration(item.current.meanDuration),
        formatCount(item.current.meanCount),
      ])
    );

    content = content.concat(
      output.removed.map((item) => [
        item.name,
        'Removed',
        formatDuration(item.baseline.meanDuration),
        formatCount(item.baseline.meanCount),
      ])
    );

    const markdownContent = markdownTable([COLUMNS, ...content]);
    console.log(markdownContent);
    writeToFile(markdownContent);
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

async function writeToFile(markdownContent: string) {
  console.log('\n| ----- markdown-builder.ts output > json -----');

  try {
    await fs.writeFile(outputMarkdownFilePath, markdownContent);

    console.log(`| ✅  Written output file ${outputMarkdownFilePath}`);
    console.log(`| 🔗 ${path.resolve(outputMarkdownFilePath)}`);
  } catch (error) {
    console.log(`| ❌  Could not write file ${outputMarkdownFilePath}`);
    console.log(`| 🔗 ${path.resolve(outputMarkdownFilePath)}`);
    console.error(error);
    throw error;
  }

  console.log('| -------------------------------------\n');
}

buildMarkdown();
