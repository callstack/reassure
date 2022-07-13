import type { CommandModule } from 'yargs';
import { run as measure } from './measure';

export async function run() {
  measure({ baseline: true });
  measure({ baseline: false, compare: true });
}

export const command: CommandModule = {
  command: 'check-stability',
  describe: 'Checks how stable is the current machine by running measurements twice for the same code',
  handler: () => run(),
};
