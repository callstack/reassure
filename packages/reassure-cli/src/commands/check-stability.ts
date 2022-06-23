import type { CommandModule } from 'yargs';
import { run as measure } from './measure';
import { run as compare } from './compare';

export async function run() {
  measure({ baseline: true });
  measure({ baseline: false });
  return compare();
}

export const command: CommandModule = {
  command: 'check-stability',
  describe: 'Checks how stable is the current machine by running measurements twice for the same code',
  handler: () => run(),
};
