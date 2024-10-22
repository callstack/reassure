import { performance as perf } from 'perf_hooks';
import { getTestingLibrary } from './testing-library';

export function applyRenderPolyfills() {
  const testingLibrary = getTestingLibrary();
  if (testingLibrary === 'react-native') {
    polyfillPerformanceNow();
  }
}

export function restoreRenderPolyfills() {
  const testingLibrary = getTestingLibrary();
  if (testingLibrary === 'react-native') {
    restorePerformanceNow();
  }
}

/**
 * React Native Jest preset mocks the global.performance object, with `now()` method being `Date.now()`.
 * Ref: https://github.com/facebook/react-native/blob/3dfe22bd27429a43b4648c597b71f7965f31ca65/packages/react-native/jest/setup.js#L41
 *
 * Then React uses `performance.now()` in `Scheduler` to measure component render time.
 * https://github.com/facebook/react/blob/45804af18d589fd2c181f3b020f07661c46b73ea/packages/scheduler/src/forks/Scheduler.js#L59
 */
let originalPerformanceNow: () => number;

function polyfillPerformanceNow() {
  originalPerformanceNow = global.performance?.now;
  global.performance.now = () => perf.now();
}

function restorePerformanceNow() {
  globalThis.performance.now = originalPerformanceNow;
}
