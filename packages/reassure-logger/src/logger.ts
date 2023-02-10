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

const colorPrimary = chalk.hex(colors.primary);
const colorWarn = chalk.hex(colors.warn);
const colorDim = chalk.hex(colors.dim);

export function configure(options: Partial<LoggerOptions>) {
  config = { ...config, ...options };
}

// Jest is wrapping console.* calls, so we need to get the raw console object
const rawConsole = require('console') as typeof console;

export function verbose(prefix: string, ...args: unknown[]) {
  if (!config.verbose || config.silent) return;

  rawConsole.log(colorPrimary(prefix), colorDim(...args));
}

export function log(prefix: string, ...args: unknown[]) {
  if (config.silent) return;

  rawConsole.log(colorPrimary(prefix), ...args);
}

export function warn(prefix: string, ...args: unknown[]) {
  if (config.silent) return;

  rawConsole.warn(colorPrimary(prefix), colorWarn(...args));
}

export function error(prefix: string, ...args: unknown[]) {
  rawConsole.error(colorPrimary(prefix), colorDim(...args));
}

export function newLine() {
  rawConsole.log();
}

export function bindLogger(prefix: string) {
  return {
    verbose: (...args: unknown[]) => verbose(prefix, ...args),
    log: (...args: unknown[]) => log(prefix, ...args),
    warn: (...args: unknown[]) => warn(prefix, ...args),
    error: (...args: unknown[]) => error(prefix, ...args),
    newLine: () => newLine(),
  };
}
