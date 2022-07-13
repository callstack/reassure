#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { command as measure } from './commands/measure';
import { command as checkStability } from './commands/check-stability';

yargs(hideBin(process.argv))
  .command(measure)
  .command(checkStability)
  .help()
  .demandCommand(1, 'Please specify a command')
  .recommendCommands()
  .strict()
  .parse();
