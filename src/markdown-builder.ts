import * as fs from 'fs/promises';
import * as path from 'path';
import minimist from 'minimist';
//@ts-ignore
import { emphasis } from 'markdown-builder';
import { markdownTable } from './markdown-table';
import { AnalyserOutput, STATUSES } from './shared';
import {
  formatChange,
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

type LoadFileResult = {
  data: AnalyserOutput;
};

const COLUMNS = [
  'Name',
  'Status',
  'Render duration change',
  'Render count change',
] as const;

const loadFile = async (path: string): Promise<LoadFileResult> => {
  const data = await fs.readFile(path, 'utf8');
  return JSON.parse(data);
};

const formatRenderDurationChange = (stats: any) => {
  const { durationDiff, durationDiffPercent } = stats;
  const { meanDuration: baselineMeanDuration } = stats.baseline;
  const { meanDuration: currentMeanDuration } = stats.current;
  return `${formatDuration(baselineMeanDuration)} -> ${formatDuration(
    currentMeanDuration
  )}, ${formatDurationChange(durationDiff)}, ${formatPercentChange(
    durationDiffPercent
  )}`;
};

const formatRenderCountChange = (stats: any) => {
  const { countDiff, countDiffPercent } = stats;
  const { meanCount: baselineMeanCount } = stats.baseline;
  const { meanCount: currentMeanCount } = stats.current;
  return `${baselineMeanCount} -> ${currentMeanCount}, ${formatChange(
    countDiff
  )}, ${formatPercentChange(countDiffPercent)}`;
};

export const buildMarkdown = async () => {
  try {
    const { data } = await loadFile(analyserOutputFilePath);
    const content = STATUSES.map((status) => {
      const rows = data[status].map((stats) => {
        const name = stats.name;
        if (status === 'countChanged') {
          const renderCountChange = emphasis.b(formatRenderCountChange(stats));
          return [
            name,
            emphasis.b('RENDER_COUNT_CHANGED'),
            '-',
            renderCountChange,
          ];
        }
        const statsStatus = stats.durationDiffStatus;
        const renderDurationChange = emphasis.b(
          formatRenderDurationChange(stats)
        );

        return [name, emphasis.b(statsStatus), renderDurationChange, '-'];
      });

      return rows.length === 0 ? rows : rows.concat([[]]); // adding empty row after each status
    }).flat();
    const markdownContent = markdownTable([[...COLUMNS], ...content]);
    console.log(markdownContent);
    writeToJson(markdownContent);
  } catch (error: any) {
    console.error(`Error loading file from: ${path}`, error);
  }
};

async function writeToJson(markdownContent: string) {
  console.log('\n| ----- markdown-builder.ts output > json -----');

  try {
    await fs.writeFile(outputMarkdownFilePath, markdownContent);

    console.log(`| ✅  Written output file ${outputMarkdownFilePath}`);
    console.log(`| 🔗 ${path.resolve(outputMarkdownFilePath)}`);
  } catch (error) {
    console.log(`| ❌  Could not write file ${outputMarkdownFilePath}`);
    console.log(`| 🔗 ${path.resolve(outputMarkdownFilePath)}`);
    console.error(error);
  }

  console.log('| -------------------------------------\n');
}

buildMarkdown();
