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

const colorBrand = chalk.hex(colors.brand);
const colorError = chalk.hex(colors.error);
const colorWarn = chalk.hex(colors.warn);
const colorVerbose = chalk.hex(colors.default);

const prefix: string = colorBrand('reassure: ');

export function configure(options: Partial<LoggerOptions>) {
  config = { ...config, ...options };
}

// Jest is wrapping console.* calls, so we need to get the raw console object
const rawConsole = require('console') as typeof console;

export function error(...args: unknown[]) {
  rawConsole.error(colorError(prefix, ...args));
}

export function warn(...args: unknown[]) {
  if (config.silent) return;

  rawConsole.warn(colorWarn(prefix, ...args));
}

export function log(...args: unknown[]) {
  if (config.silent) return;

  return rawConsole.log(prefix, ...args);
}

export function colorLog(color: keyof typeof colors, ...args: unknown[]) {
  if (config.silent) return;

  return rawConsole.log(chalk.hex(colors[color])(args));
}

export function verbose(...args: unknown[]) {
  if (!config.verbose || config.silent) return;

  rawConsole.log(colorVerbose(prefix, ...args));
}
