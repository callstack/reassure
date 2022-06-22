#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { command as measure } from './commands/measure';
import { command as compare } from './commands/compare';
import { command as checkStability } from './commands/check-stability';

yargs(hideBin(process.argv)).command(measure).command(compare).command(checkStability).help().parse();
