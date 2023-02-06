import type { CommandModule } from 'yargs';
import { logger } from '../utils/logger';
import { run as init } from './init';
import { MeasureOptions, run as measure } from './measure';
import { run as checkStability } from './check-stability';

const { Select, Prompt, Confirm } = require('enquirer');

async function handleInit() {
  const jsStandardPrompt = new Select({
    name: 'jsStandard',
    message: 'Select your code standard',
    choices: [
      { message: 'JavaScript', name: 'js' },
      { message: 'TypeScript', name: 'ts' },
    ],
  });

  const jsStandard = await jsStandardPrompt.run();

  await init({ 'no-ascii-art': true, verbose: true, javascript: jsStandard === 'js' });
}
async function handleMeasure() {
  /**
   * baseline?: boolean;
   * compare?: boolean;
   * branch?: string;
   * commitHash?: string;
   */

  const options: MeasureOptions = {};

  const baselinePrompt = new Confirm({
    name: 'baseline',
    message: 'Should reassure generate the baseline results?',
    initial: false,
  });

  const comparePrompt = new Confirm({
    name: 'compare',
    message: 'Should reassure compare the generated results?',
    initial: false,
  });

  if (baselinePrompt) {
    options.baseline = true;
  } else {
    if (comparePrompt) {
      options.compare = true;

      const commitHashPrompt = new Prompt({
        name: 'commitHash',
        message: 'Would you like to compare against any particular commit hash?',
      });

      if (commitHashPrompt) {
        options.commitHash = commitHashPrompt;
      } else {
        const branchPrompt = new Prompt({
          name: 'branch',
          message: 'What branch do you want to use for comparison with the current branch?',
          initial: 'main',
        });

        options.branch = branchPrompt;
      }
    }
  }

  await measure({ 'no-ascii-art': true, verbose: true, ...options });
}
async function handleCheckStability() {
  await checkStability({ 'no-ascii-art': true, verbose: true });
}

export async function run(): Promise<void> {
  logger.hello(true);
  const cliModulePrompt = new Select({
    name: 'cliModule',
    message: 'What would you like to do?',
    choices: [
      { message: 'Initialise reassure', name: 'init' },
      { message: 'Measure performance', name: 'measure' },
      { message: 'Test platform stability', name: 'check-stability' },
    ],
  });

  const answer = await cliModulePrompt.run();

  switch (answer) {
    case 'init':
      await handleInit();
      break;
    case 'measure':
      handleMeasure();

      break;
    case 'check-stability':
      handleCheckStability();

      break;
    default:
      console.log('default');
  }

  logger.bye(true);
}

export const command: CommandModule<{}, {}> = {
  command: ['setup', '$0'],
  describe: 'Interactive CLI prompter module',
  handler: () => run(),
};
