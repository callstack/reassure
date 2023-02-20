import type { CommandModule } from 'yargs';

import { applyCommonOptions, CommonOptions } from '../options';
import { bye, configureLoggerOptions, hello } from '../utils/logger';
import { run as measure } from './measure';

export async function run(options: CommonOptions) {
  configureLoggerOptions(options);

  hello(options);

  await measure({ baseline: true, isSubRoutine: true });
  await measure({ baseline: false, compare: true, isSubRoutine: true });

  bye(options);
}

export const command: CommandModule<{}, CommonOptions> = {
  command: 'check-stability',
  describe: 'Checks how stable is the current machine by running measurements twice for the same code',
  builder: (yargs) => {
    return applyCommonOptions(yargs);
  },
  handler: (args) => run(args),
};
