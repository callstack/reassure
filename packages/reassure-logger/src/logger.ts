import readline from 'readline';
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

export function error(message?: string, ...args: unknown[]) {
  rawConsole.error(colorError(message, ...args));
}

export function warn(message?: string, ...args: unknown[]) {
  if (config.silent) return;

  rawConsole.warn(colorWarn(message, ...args));
}

export function log(message?: string, ...args: unknown[]) {
  if (config.silent) return;

  rawConsole.log(message, ...args);
}

export function verbose(message?: string, ...args: unknown[]) {
  if (!config.verbose || config.silent) return;

  rawConsole.log(colorVerbose(message, ...args));
}

export function color(color: keyof typeof colors, ...args: unknown[]) {
  if (config.silent) return;

  return rawConsole.log(chalk.hex(colors[color])(...args));
}

/** Log message that indicates progress of operation, does not output the trailing newline. */
export function progress(message: string) {
  process.stdout.write(message);
}

/**
 * Clears current lint. To be used in conjunction with `progress`.
 */
export function clearLine() {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
}
