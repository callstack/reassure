import { bindLogger, configure } from '@callstack/reassure-logger';
import type { CommonOptions } from '../options';

export const logger = bindLogger('reassure-cli');

export function configureLoggerOptions(options: CommonOptions) {
  configure({
    silent: options.silent,
    verbose: options.verbose,
  });
}
