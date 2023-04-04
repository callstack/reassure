#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { command as init } from './commands/init';
import { command as checkStability } from './commands/check-stability';
import { command as measure } from './commands/measure';

yargs(hideBin(process.argv))
  .command(measure)
  .command(init)
  .command(checkStability)
  .help()
  .demandCommand(1, 'Please specify a command')
  .recommendCommands()
  .strict()
  .parse();
