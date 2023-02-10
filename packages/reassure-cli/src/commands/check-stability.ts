import type { CommandModule } from 'yargs';
import { applyCommonOptions, CommonOptions } from '../options';
import { configureLoggerOptions } from '../utils/logger';
import { run as measure } from './measure';

export async function run(options: CommonOptions) {
  configureLoggerOptions(options);

  await measure({ ...options, baseline: true });
  await measure({ ...options, baseline: false, compare: true });
}

export const command: CommandModule<{}, CommonOptions> = {
  command: 'check-stability',
  describe: 'Checks how stable is the current machine by running measurements twice for the same code',
  builder: (yargs) => {
    return applyCommonOptions(yargs);
  },
  handler: (args) => run(args),
};
