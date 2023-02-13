import { logger } from '@callstack/reassure-logger';
import type { CommonOptions } from '../options';

export function configureLoggerOptions(options: CommonOptions) {
  logger.configure({
    silent: options.silent,
    verbose: options.verbose,
  });
}
