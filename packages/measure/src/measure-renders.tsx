import * as logger from '@callstack/reassure-logger';
import { measureRendersInternal, MeasureRendersOptions } from './measure-renders-common';
import { measureRendersNative } from './measure-renders-native';
import { writeTestStats } from './output';
import { getTestingLibrary } from './testing-library';
import { MeasureRendersResults } from './types';

export async function measureRenders(
  ui: React.ReactElement,
  options?: MeasureRendersOptions
): Promise<MeasureRendersResults> {
  let stats: MeasureRendersResults;
  if (getTestingLibrary() === 'react-native') {
    stats = await measureRendersNative(ui, options);
  } else {
    stats = await measureRendersInternal(ui, options);
  }

  if (options?.writeFile !== false) {
    await writeTestStats(stats, 'render');
  }

  return stats;
}

/**
 * @deprecated The `measurePerformance` function has been renamed to `measureRenders`. The `measurePerformance` alias is now deprecated and will be removed in future releases.
 */
export async function measurePerformance(
  ui: React.ReactElement,
  options?: MeasureRendersOptions
): Promise<MeasureRendersResults> {
  logger.warnOnce(
    'The `measurePerformance` function has been renamed to `measureRenders`.\n\nThe `measurePerformance` alias is now deprecated and will be removed in future releases.'
  );

  return await measureRenders(ui, options);
}
