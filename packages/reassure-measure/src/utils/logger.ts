import { bindLogger, configure } from '@callstack/reassure-logger';

export const logger = bindLogger('reassure-measure');

configure({
  verbose: process.env.REASSURE_VERBOSE === 'true',
  silent: process.env.REASSURE_SILENT === 'true',
});
