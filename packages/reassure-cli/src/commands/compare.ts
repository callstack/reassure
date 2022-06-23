import type { CommandModule } from 'yargs';
import { compare } from '@reassure/reassure-compare';

export async function run() {
  return compare({});
}

export const command: CommandModule = {
  command: 'compare',
  describe: 'Compares gathered baseline and current measurements',
  handler: () => run(),
};
