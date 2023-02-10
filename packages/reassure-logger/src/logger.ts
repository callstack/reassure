import chalk from 'chalk';
import { colors } from './colors';

export type LoggerOptions = {
  /** Silent all non-error logs */
  silent: boolean;

  /** Show verbose-level logs (default not shown) */
  verbose: boolean;
};

const defaultConfig: LoggerOptions = {
  verbose: false,
  silent: false,
} as const;

let config: LoggerOptions = { ...defaultConfig };

const colorError = chalk.hex(colors.error);
const colorWarn = chalk.hex(colors.warn);
const colorVerbose = chalk.hex(colors.verbose);

export function configure(options: Partial<LoggerOptions>) {
  config = { ...config, ...options };
}

// Jest is wrapping console.* calls, so we need to get the raw console object
const rawConsole = require('console') as typeof console;

export function error(...args: unknown[]) {
  rawConsole.error(colorError(...args));
}

export function warn(...args: unknown[]) {
  if (config.silent) return;

  rawConsole.warn(colorWarn(...args));
}

export function log(...args: unknown[]) {
  if (config.silent) return;

  rawConsole.log(...args);
}

export function verbose(...args: unknown[]) {
  if (!config.verbose || config.silent) return;

  rawConsole.log(colorVerbose(...args));
}
