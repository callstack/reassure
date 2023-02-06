import type { CommandModule } from 'yargs';
import { logger } from '@callstack/reassure-logger';
import { applyCommonOptions, CommonOptions } from '../options';
import { configureLoggerOptions } from '../utils/logger';
import { run as measure } from './measure';

export async function run(options: CommonOptions) {
  configureLoggerOptions(options);
  logger.configure(options);
  logger.hello();
  await measure({ baseline: true, 'no-ascii-art': true });
  await measure({ baseline: false, compare: true, 'no-ascii-art': true });
  logger.bye();
}

export const command: CommandModule<{}, CommonOptions> = {
  command: 'check-stability',
  describe: 'Checks how stable is the current machine by running measurements twice for the same code',
  builder: (yargs) => {
    return applyCommonOptions(yargs);
  },
  handler: (args) => run(args),
};
