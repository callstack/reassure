import * as React from 'react';
import { View } from 'react-native';
import { measureRender, processRunResults } from '../measure';
import { resetHasShownFlagsOutput } from '../output';

const errorsToIgnore = ['❌ Measure code is running under incorrect Node.js configuration.'];
const realConsole = jest.requireActual('console') as Console;

beforeEach(() => {
  jest.spyOn(realConsole, 'error').mockImplementation((message) => {
    if (!errorsToIgnore.some((error) => message.includes(error))) {
      realConsole.error(message);
    }
  });
});

test('measureRender run test given number of times', async () => {
  const scenario = jest.fn(() => Promise.resolve(null));
  const result = await measureRender(<View />, { runs: 20, scenario });
  expect(result.runs).toBe(20);
  expect(result.durations).toHaveLength(20);
  expect(result.counts).toHaveLength(20);
  expect(result.meanCount).toBe(1);
  expect(result.stdevCount).toBe(0);

  // Test is actually run 21 times = 20 runs + 1 drop worst
  expect(scenario).toHaveBeenCalledTimes(21);
});

test('measureRender should log error when running under incorrect node flags', async () => {
  resetHasShownFlagsOutput();
  const result = await measureRender(<View />, { runs: 1 });

  expect(result.runs).toBe(1);
  expect(realConsole.error).toHaveBeenCalledWith(`❌ Measure code is running under incorrect Node.js configuration.
Performance test code should be run in Jest with certain Node.js flags to increase measurements stability.
Make sure you use the Reassure CLI and run it using "reassure" command.`);
});

function IgnoreChildren(_: React.PropsWithChildren<{}>) {
  return <View />;
}

test('measureRender does not meassure wrapper', async () => {
  const wrapper = (ui: React.ReactElement) => <IgnoreChildren>{ui}</IgnoreChildren>;
  const result = await measureRender(<View />, { wrapper });
  expect(result.runs).toBe(10);
  expect(result.durations).toHaveLength(10);
  expect(result.counts).toHaveLength(10);
  expect(result.meanDuration).toBe(0);
  expect(result.meanCount).toBe(0);
  expect(result.stdevDuration).toBe(0);
  expect(result.stdevCount).toBe(0);
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
