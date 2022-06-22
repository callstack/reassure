import type { CommandModule } from 'yargs';
import { compare } from '@reassure/reassure-compare';

export async function run() {
  return compare({});
}

export const command: CommandModule = {
  command: 'compare',
  describe: 'compares gathered baseline and current measurements',
  handler: () => run(),
};
