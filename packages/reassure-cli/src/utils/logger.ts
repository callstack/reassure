import { logger } from '@callstack/reassure-logger';

import type { CommonOptions } from '../options';

import { BYE, HELLO } from './ascii';

export function configureLoggerOptions(options: CommonOptions) {
  logger.configure({
    silent: options.silent,
    verbose: options.verbose,
  });
}

export function ciSetupHint(options: CommonOptions) {
  if (options.silent) return;

  logger.colorLog('default', 'Finished initalizing new reassure testing environment.');
  logger.colorLog('default', 'Please refer to our CI guide in order to set up your pipelines.');
  logger.colorLog('default', 'Find more @ https://callstack.github.io/reassure/docs/installation#ci-setup');
}

export function hello(options?: CommonOptions) {
  if (options?.isSubRoutine) return;

  logger.colorLog('brand', HELLO);
}

export function bye(options?: CommonOptions) {
  if (options?.isSubRoutine) return;

  logger.colorLog('brand', BYE);
}
