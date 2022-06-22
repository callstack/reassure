#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import * as test from './commands/test';
import * as measure from './commands/measure';
import * as compare from './commands/compare';

yargs(hideBin(process.argv)).command(test).command(measure).command(compare).help().parse();
