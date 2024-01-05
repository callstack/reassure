import { configure } from '@callstack/reassure-logger';
import type { CommonOptions } from '../options';

export function configureLoggerOptions(options: CommonOptions) {
  configure({
    silent: options.silent,
    verbose: options.verbose,
  });
}
