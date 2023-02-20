import type yargs from 'yargs';

export interface CommonOptions {
  /** Silent all non-error messages. */
  silent?: boolean;

  /** Show verbose-level logs. */
  verbose?: boolean;

  //** Tells the CLI if command is ran as a sub-routine */
  isSubRoutine?: boolean;
}

export function applyCommonOptions(yargs: yargs.Argv<{}>) {
  return yargs.options({
    silent: {
      type: 'boolean',
      default: false,
      describe: 'Silence all logs except errors',
    },
    verbose: {
      type: 'boolean',
      default: false,
      describe: 'Output verbose level logs',
    },
    isSubRoutine: {
      type: 'boolean',
      default: false,
      describe: 'Run command as sub-routine',
    },
  });
}
