import { processRunResults } from '../measure-helpers';

test('processRunResults calculates correct means and stdevs', () => {
  const input = [
    { duration: 10, count: 2 },
    { duration: 12, count: 2 },
    { duration: 14, count: 2 },
  ];

  expect(processRunResults(input, 3, 0)).toEqual({
    runs: 3,
    meanDuration: 12,
    stdevDuration: 2,
    durations: [14, 12, 10],
    meanCount: 2,
    stdevCount: 0,
    counts: [2, 2, 2],
  });
});

test('processRunResults applies warmupRuns option', () => {
  const input = [
    { duration: 23, count: 1 }, // warmup run
    { duration: 20, count: 5 },
    { duration: 24, count: 5 },
    { duration: 22, count: 5 },
  ];

  expect(processRunResults(input, 4, 1)).toEqual({
    runs: 3,
    meanDuration: 22,
    stdevDuration: 2,
    durations: [24, 22, 20],
    meanCount: 5,
    stdevCount: 0,
    counts: [5, 5, 5],
  });
});

test('processRunResults supports "runs: quick-3" option', () => {
  const input = [
    { duration: 100, count: 1 }, // warmup run
    { duration: 1, count: 5 },
    { duration: 6, count: 5 },
    { duration: 29, count: 5 },
  ];

  expect(processRunResults(input, 'quick-3', 1)).toEqual({
    runs: 6,
    meanDuration: 9,
    stdevDuration: 10,
    durations: [29, 6, 6, 6, 6, 1],
    meanCount: 5,
    stdevCount: 0,
    counts: [5, 5, 5, 5, 5, 5],
  });
});
