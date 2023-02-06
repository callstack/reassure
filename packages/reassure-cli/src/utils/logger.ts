import { logger } from '@callstack/reassure-logger';
import type { CommonOptions } from '../options';

export function configureLoggerOptions(options: CommonOptions) {
  logger.configure({
    silent: options.silent,
    verbose: options.verbose,
  });
}
// type Options = Pick<DefaultOptions, 'no-ascii-art' | 'silent' | 'verbose'>;

// class Logger {
//   private 'no-ascii-art'?: boolean = false;
//   private silent?: boolean = false;
//   private verbose?: boolean = false;

//   public static prefix: string = chalk.hex(CHALK.colors.primary)('reassure-cli: ');

//   private isOptionValid = (data: any): data is keyof Options =>
//     data === 'no-ascii-art' || data === 'silent' || data === 'verbose';

//   public configure = (options: Options) => {
//     if (options) {
//       Object.keys(options).map((key) => {
//         if (this.isOptionValid(key)) {
//           this[key] = options[key];
//         }
//       });
//     }
//   };

//   public hello = (force: boolean = false) => {
//     if ((this['no-ascii-art'] || this.silent) && !force) return;
//     console.log(chalk.hex(CHALK.colors.primary)(hello));
//   };

//   public bye = (force: boolean = false) => {
//     if ((this['no-ascii-art'] || this.silent) && !force) return;
//     return console.log(chalk.hex(CHALK.colors.primary)(bye));
//   };

//   public ciSetupHint = () => {
//     if (this.silent) return;

//     console.log(chalk.hex(CHALK.colors.dim)('Finished initalizing new reassure testing environment.'));
//     console.log(chalk.hex(CHALK.colors.dim)('Please refer to our CI guide in order to set up your pipelines.'));
//     console.log(
//       chalk.hex(CHALK.colors.dim)('Find more @ https://callstack.github.io/reassure/docs/installation#ci-setup')
//     );
//   };

//   public log = (...args: any[]) => {
//     if (this.verbose) {
//       console.log(Logger.prefix, chalk.hex(CHALK.colors.dim)(args));
//     }
//   };

//   public warn = (...args: any[]) => {
//     if (this.silent) return;

//     console.log(Logger.prefix, chalk.hex(CHALK.colors.warn)(args));
//   };

//   public error = (...args: any[]) => {
//     console.error(Logger.prefix, chalk.hex(CHALK.colors.error)(args));
//   };
// }

// export const logger = new Logger();
