import * as React from 'react';

afterEach(() => {
  jest.dontMock('react-test-config');
  jest.dontMock('@testing-library/react-native');
  jest.dontMock('@testing-library/react');
  jest.resetModules();
});

function mockTestingLibraries() {
  jest.doMock('@testing-library/react-native', () => ({
    cleanup: jest.fn(),
    render: jest.fn(),
  }));

  jest.doMock('@testing-library/react', () => ({
    cleanup: jest.fn(),
    render: jest.fn(),
  }));
}

function setupMeasureRendersTest(reactTestConfigFactory: () => unknown) {
  mockTestingLibraries();
  jest.doMock('react-test-config', reactTestConfigFactory);

  const { measureRenders } = require('../measure-renders') as typeof import('../measure-renders');
  const { configure } = require('../config') as typeof import('../config');
  const { setHasShownFlagsOutput } = require('../output') as typeof import('../output');
  configure({ testingLibrary: 'react-native' });
  setHasShownFlagsOutput(true);

  return measureRenders;
}

test('disables React owner stacks before measuring renders', async () => {
  jest.resetModules();
  const disableOwnerStacks = jest.fn();

  const measureRenders = setupMeasureRendersTest(() => ({ disableOwnerStacks }));

  await measureRenders(React.createElement('View'), {
    runs: 1,
    warmupRuns: 0,
    writeFile: false,
  });

  expect(disableOwnerStacks).toHaveBeenCalledTimes(1);
});

test('disables React owner stacks only once', async () => {
  jest.resetModules();
  const disableOwnerStacks = jest.fn();

  const measureRenders = setupMeasureRendersTest(() => ({ disableOwnerStacks }));
  const options = {
    runs: 1,
    warmupRuns: 0,
    writeFile: false,
  };

  await measureRenders(React.createElement('View'), options);
  await measureRenders(React.createElement('View'), options);

  expect(disableOwnerStacks).toHaveBeenCalledTimes(1);
});
