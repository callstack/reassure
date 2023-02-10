import chalk from 'chalk';

export type LoggerOptions = {
  /** Silent all non-error logs */
  silent: boolean;

  /** Show verbose-level logs (default not shown) */
  verbose: boolean;
};

const colors = {
  primary: '#4fe89a',
  error: '#E73A0E',
  warn: '#E7900E',
  dim: '#919191',
} as const;

let prefix = chalk.hex(colors.primary)('reassure-cli: ');

const defaultOptions: LoggerOptions = {
  verbose: false,
  silent: false,
} as const;

let options: LoggerOptions = { ...defaultOptions };

export function configure(options: Partial<LoggerOptions>) {
  options = { ...options, ...options };
}

export function verbose(...args: any[]) {
  if (!options.verbose || options.silent) return;

  console.log(prefix, chalk.hex(colors.dim)(args));
}

export function log(...args: any[]) {
  if (options.silent) return;

  console.log(prefix, chalk.hex(colors.dim)(args));
}

export function warn(...args: any[]) {
  if (options.silent) return;

  console.warn(prefix, chalk.hex(colors.warn)(args));
}

export function error(...args: any[]) {
  console.error(prefix, chalk.hex(colors.error)(args));
}
