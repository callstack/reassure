import { measureFunctionInternal } from '../measure-function';

// Exponentially slow function
function fib(n: number): number {
  if (n <= 1) {
    return n;
  }

  return fib(n - 1) + fib(n - 2);
}

test('measureFunctionInternal captures results', () => {
  const fn = jest.fn(() => fib(5));
  const results = measureFunctionInternal(fn, { runs: 1, dropWorst: 0 });

  expect(fn).toHaveBeenCalledTimes(1);
  expect(results.runs).toBe(1);
  expect(results.counts).toEqual([1]);
});

test('measureFunctionInternal runs specified number of times', () => {
  const fn = jest.fn(() => fib(5));
  const results = measureFunctionInternal(fn, { runs: 20, dropWorst: 0 });

  expect(fn).toHaveBeenCalledTimes(20);
  expect(results.runs).toBe(20);
  expect(results.durations).toHaveLength(20);
  expect(results.counts).toHaveLength(20);
  expect(results.meanCount).toBe(1);
  expect(results.stdevCount).toBe(0);
});

test('measureFunctionInternal applies dropsWorst option', () => {
  const fn = jest.fn(() => fib(5));
  const results = measureFunctionInternal(fn, { runs: 10, dropWorst: 1 });

  expect(fn).toHaveBeenCalledTimes(11);
  expect(results.runs).toBe(10);
  expect(results.durations).toHaveLength(10);
  expect(results.counts).toHaveLength(10);
  expect(results.meanCount).toBe(1);
  expect(results.stdevCount).toBe(0);
});
