/* eslint-disable promise/prefer-await-to-then */
import stripAnsi from 'strip-ansi';
import { measureAsyncFunction } from '../measure-async-function';
import { setHasShownFlagsOutput } from '../output';

// Exponentially slow function
function fib(n: number): number {
  if (n <= 1) {
    return n;
  }

  return fib(n - 1) + fib(n - 2);
}

test('measureAsyncFunction captures results', async () => {
  const fn = jest.fn(() => Promise.resolve().then(() => fib(5)));
  const results = await measureAsyncFunction(fn, { runs: 1, warmupRuns: 0, writeFile: false });

  expect(fn).toHaveBeenCalledTimes(1);
  expect(results.runs).toBe(1);
  expect(results.counts).toEqual([1]);
});

test('measureAsyncFunction runs specified number of times', async () => {
  const fn = jest.fn(() => Promise.resolve().then(() => fib(5)));
  const results = await measureAsyncFunction(fn, { runs: 20, warmupRuns: 0, writeFile: false });

  expect(fn).toHaveBeenCalledTimes(20);
  expect(results.runs).toBe(20);
  expect(results.durations.length + (results.outlierDurations?.length ?? 0)).toBe(20);
  expect(results.counts).toHaveLength(20);
  expect(results.meanCount).toBe(1);
  expect(results.stdevCount).toBe(0);
});

test('measureAsyncFunction applies "warmupRuns" option', async () => {
  const fn = jest.fn(() => Promise.resolve().then(() => fib(5)));
  const results = await measureAsyncFunction(fn, { runs: 10, warmupRuns: 1, writeFile: false });

  expect(fn).toHaveBeenCalledTimes(11);
  expect(results.runs).toBe(10);
  expect(results.durations.length + (results.outlierDurations?.length ?? 0)).toBe(10);
  expect(results.counts).toHaveLength(10);
  expect(results.meanCount).toBe(1);
  expect(results.stdevCount).toBe(0);
});

test('measureAsyncFunction executes setup and cleanup functions for each run', async () => {
  const fn = jest.fn(() => Promise.resolve().then(() => fib(5)));
  const beforeFn = jest.fn();
  const afterFn = jest.fn();
  const results = await measureAsyncFunction(fn, {
    runs: 10,
    warmupRuns: 1,
    writeFile: false,
    beforeEach: beforeFn,
    afterEach: afterFn,
  });

  expect(beforeFn).toHaveBeenCalledTimes(11);
  expect(fn).toHaveBeenCalledTimes(11);
  expect(afterFn).toHaveBeenCalledTimes(11);
  expect(results.runs).toBe(10);
  expect(results.durations.length + (results.outlierDurations?.length ?? 0)).toBe(10);
  expect(results.counts).toHaveLength(10);
});

const errorsToIgnore = ['❌ Measure code is running under incorrect Node.js configuration.'];
const realConsole = jest.requireActual('console') as Console;

beforeEach(() => {
  jest.spyOn(realConsole, 'error').mockImplementation((message) => {
    if (!errorsToIgnore.some((error) => message.includes(error))) {
      realConsole.error(message);
    }
  });
});

test('measureAsyncFunction should log error when running under incorrect node flags', async () => {
  setHasShownFlagsOutput(false);
  const results = await measureAsyncFunction(jest.fn(), { runs: 1, writeFile: false });

  expect(results.runs).toBe(1);
  const consoleErrorCalls = jest.mocked(realConsole.error).mock.calls;
  expect(stripAnsi(consoleErrorCalls[0][0])).toMatchInlineSnapshot(`
    "❌ Measure code is running under incorrect Node.js configuration.
    Performance test code should be run in Jest with certain Node.js flags to increase measurements stability.
    Make sure you use the Reassure CLI and run it using "reassure" command."
  `);
});
