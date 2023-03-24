import type yargs from 'yargs';

export interface CommonOptions {
  /** Silent all non-error messages. */
  silent: boolean;

  /** Show verbose-level logs. */
  verbose: boolean;
}

export function applyCommonOptions(yargs: yargs.Argv<{}>) {
  return yargs
    .option('silent', {
      type: 'boolean',
      default: false,
      describe: 'Silence all logs except errors',
    })
    .option('verbose', {
      type: 'boolean',
      default: false,
      describe: 'Output verbose level logs',
    });
}
