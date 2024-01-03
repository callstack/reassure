import * as React from 'react';
import { View } from 'react-native';
import { buildUiToRender, measureRendersInternal } from '../measure-renders';
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

test('measureRendersInternal run test given number of times', async () => {
  const scenario = jest.fn(() => Promise.resolve(null));
  const results = await measureRendersInternal(<View />, { runs: 20, scenario });
  expect(results.runs).toBe(20);
  expect(results.durations).toHaveLength(20);
  expect(results.counts).toHaveLength(20);
  expect(results.meanCount).toBe(1);
  expect(results.stdevCount).toBe(0);

  // Test is actually run 21 times = 20 runs + 1 warmup runs
  expect(scenario).toHaveBeenCalledTimes(21);
});

test('measureRendersInternal applies "warmupRuns" option', async () => {
  const scenario = jest.fn(() => Promise.resolve(null));
  const results = await measureRendersInternal(<View />, { runs: 10, scenario });

  expect(scenario).toHaveBeenCalledTimes(11);
  expect(results.runs).toBe(10);
  expect(results.durations).toHaveLength(10);
  expect(results.counts).toHaveLength(10);
  expect(results.meanCount).toBe(1);
  expect(results.stdevCount).toBe(0);
});

test('measureRendersInternal should log error when running under incorrect node flags', async () => {
  resetHasShownFlagsOutput();
  const results = await measureRendersInternal(<View />, { runs: 1 });

  expect(results.runs).toBe(1);
  expect(realConsole.error).toHaveBeenCalledWith(`❌ Measure code is running under incorrect Node.js configuration.
Performance test code should be run in Jest with certain Node.js flags to increase measurements stability.
Make sure you use the Reassure CLI and run it using "reassure" command.`);
});

function IgnoreChildren(_: React.PropsWithChildren<{}>) {
  return <View />;
}

test('measureRendersInternal does not measure wrapper execution', async () => {
  const results = await measureRendersInternal(<View />, { wrapper: IgnoreChildren });
  expect(results.runs).toBe(10);
  expect(results.durations).toHaveLength(10);
  expect(results.counts).toHaveLength(10);
  expect(results.meanDuration).toBe(0);
  expect(results.meanCount).toBe(0);
  expect(results.stdevDuration).toBe(0);
  expect(results.stdevCount).toBe(0);
});

function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return <View testID="wrapper">{children}</View>;
}

test('buildUiToRender wraps ui with wrapper', () => {
  const ui = <View testID="ui" />;
  const onRender = jest.fn();
  const result = buildUiToRender(ui, onRender, Wrapper);
  expect(result).toMatchInlineSnapshot(`
    <Wrapper>
      <UNDEFINED
        id="REASSURE_ROOT"
        onRender={[MockFunction]}
      >
        <View
          testID="ui"
        />
      </UNDEFINED>
    </Wrapper>
  `);
});

test('buildUiToRender does not wrap when no wrapper is passed', () => {
  const ui = <View testID="ui" />;
  const onRender = jest.fn();
  const result = buildUiToRender(ui, onRender);
  expect(result).toMatchInlineSnapshot(`
    <UNDEFINED
      id="REASSURE_ROOT"
      onRender={[MockFunction]}
    >
      <View
        testID="ui"
      />
    </UNDEFINED>
  `);
});
