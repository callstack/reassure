import * as React from 'react';
import { View } from 'react-native';
import { measureRender, processRunResults } from '../measure';

test('measureRender run test given number of times', async () => {
  const scenario = jest.fn(() => Promise.resolve(null));
  const result = await measureRender(<View />, { runs: 20, scenario });
  expect(result.runs).toBe(20);
  expect(result.durations).toHaveLength(20);
  expect(result.counts).toHaveLength(20);
  expect(result.meanCount).toBe(1);
  expect(result.stdevCount).toBe(0);
  expect(scenario).toHaveBeenCalledTimes(21);
});

test('processRunResults calculates correct means and stdevs', () => {
  const input = [
    { duration: 10, count: 2 },
    { duration: 12, count: 2 },
    { duration: 14, count: 2 },
  ];

  expect(processRunResults(input, 0)).toEqual({
    runs: 3,
    meanDuration: 12,
    stdevDuration: 2,
    durations: [14, 12, 10],
    meanCount: 2,
    stdevCount: 0,
    counts: [2, 2, 2],
  });
});

test('processRunResults applies dropWorst option', () => {
  const input = [
    { duration: 20, count: 5 },
    { duration: 24, count: 5 },
    { duration: 22, count: 5 },
    { duration: 1000, count: 1 },
  ];

  expect(processRunResults(input, 1)).toEqual({
    runs: 3,
    meanDuration: 22,
    stdevDuration: 2,
    durations: [24, 22, 20],
    meanCount: 5,
    stdevCount: 0,
    counts: [5, 5, 5],
  });
});
