import { measureFunctionInternal } from '../measure-function';
import { resetHasShownFlagsOutput } from '../output';

// Exponentially slow function
function fib(n: number): number {
  if (n <= 1) {
    return n;
  }

  return fib(n - 1) + fib(n - 2);
}

test('measureFunctionInternal captures results', () => {
  const fn = jest.fn(() => fib(5));
  const results = measureFunctionInternal(fn, { runs: 1, warmupRuns: 0 });

  expect(fn).toHaveBeenCalledTimes(1);
  expect(results.runs).toBe(1);
  expect(results.counts).toEqual([1]);
});

test('measureFunctionInternal runs specified number of times', () => {
  const fn = jest.fn(() => fib(5));
  const results = measureFunctionInternal(fn, { runs: 20, warmupRuns: 0 });

  expect(fn).toHaveBeenCalledTimes(20);
  expect(results.runs).toBe(20);
  expect(results.durations).toHaveLength(20);
  expect(results.counts).toHaveLength(20);
  expect(results.meanCount).toBe(1);
  expect(results.stdevCount).toBe(0);
});

test('measureFunctionInternal applies "warmupRuns" option', () => {
  const fn = jest.fn(() => fib(5));
  const results = measureFunctionInternal(fn, { runs: 10, warmupRuns: 1 });

  expect(fn).toHaveBeenCalledTimes(11);
  expect(results.runs).toBe(10);
  expect(results.durations).toHaveLength(10);
  expect(results.counts).toHaveLength(10);
  expect(results.meanCount).toBe(1);
  expect(results.stdevCount).toBe(0);
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

test('measureFunctionInternal should log error when running under incorrect node flags', () => {
  resetHasShownFlagsOutput();
  const results = measureFunctionInternal(jest.fn(), { runs: 1 });

  expect(results.runs).toBe(1);
  expect(realConsole.error).toHaveBeenCalledWith(`❌ Measure code is running under incorrect Node.js configuration.
Performance test code should be run in Jest with certain Node.js flags to increase measurements stability.
Make sure you use the Reassure CLI and run it using "reassure" command.`);
});
