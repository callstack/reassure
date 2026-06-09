import type * as React from 'react';

function loadTestingLibraryModule({ rntl, rtl }: { rntl?: Record<string, unknown>; rtl?: Record<string, unknown> }) {
  jest.resetModules();

  jest.doMock('@testing-library/react-native', () => {
    if (rntl == null) {
      throw new Error('Missing RNTL');
    }

    return rntl;
  });

  jest.doMock('@testing-library/react', () => {
    if (rtl == null) {
      throw new Error('Missing RTL');
    }

    return rtl;
  });

  const configModule = require('../config') as typeof import('../config');
  const testingLibraryModule = require('../testing-library') as typeof import('../testing-library');

  return { configModule, testingLibraryModule };
}

afterEach(() => {
  jest.dontMock('@testing-library/react-native');
  jest.dontMock('@testing-library/react');
  jest.resetModules();
});

test('resolveTestingLibrary supports async RNTL render and cleanup', async () => {
  const render = jest.fn(() => Promise.resolve('render result'));
  const cleanup = jest.fn(() => Promise.resolve(undefined));

  const { configModule, testingLibraryModule } = loadTestingLibraryModule({
    rntl: { render, cleanup },
  });

  configModule.configure({ testingLibrary: 'react-native' });
  const testingLibrary = testingLibraryModule.resolveTestingLibrary();

  await expect(testingLibrary.render({} as React.ReactElement)).resolves.toBe('render result');
  await expect(testingLibrary.cleanup()).resolves.toBeUndefined();
  expect(render).toHaveBeenCalledTimes(1);
  expect(cleanup).toHaveBeenCalledTimes(1);
});

test('resolveTestingLibrary supports sync RNTL render and cleanup', () => {
  const render = jest.fn(() => 'render result');
  const cleanup = jest.fn();

  const { configModule, testingLibraryModule } = loadTestingLibraryModule({
    rntl: { render, cleanup },
  });

  configModule.configure({ testingLibrary: 'react-native' });
  const testingLibrary = testingLibraryModule.resolveTestingLibrary();

  expect(testingLibrary.render({} as React.ReactElement)).toBe('render result');
  expect(testingLibrary.cleanup()).toBeUndefined();
  expect(render).toHaveBeenCalledTimes(1);
  expect(cleanup).toHaveBeenCalledTimes(1);
});
