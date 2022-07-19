import { config, Render, Cleanup } from './config';

type TestingLibraryApi = {
  render: Render;
  cleanup: Cleanup;
};

let RNTL: TestingLibraryApi | undefined;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  RNTL = require('@testing-library/react-native');
} catch (error) {
  // Do nothing
}

let RTL: TestingLibraryApi | undefined;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  RTL = require('@testing-library/react');
} catch (error) {
  // Do nothing
}

export function resolveTestingLibrary(): TestingLibraryApi {
  if (
    typeof config.testingLibrary === 'object' &&
    typeof config.testingLibrary.render === 'function' &&
    typeof config.testingLibrary.cleanup === 'function'
  ) {
    if (config.verbose) console.log(`Reassure: using custom 'render' and 'cleanup' functions to render components`);
    return config.testingLibrary;
  }

  if (config.testingLibrary === 'react-native') {
    if (!RNTL) {
      throw new Error(`Reassure: unable to import '@testing-library/react-native' dependency`);
    }

    if (config.verbose) console.log(`Reassure: using '@testing-library/react-native' to render components`);
    return RNTL;
  }

  if (config.testingLibrary === 'react') {
    if (!RTL) {
      throw new Error(`Reassure: unable to import '@testing-library/react' dependency`);
    }

    if (config.verbose) console.log(`Reassure: using '@testing-library/react' to render components`);
    return RTL;
  }

  if (RNTL != null && RTL != null) {
    console.warn(
      `Reassure: both '@testing-library/react-native' and '@testing-library/react' are installed. Using '@testing-library/react-native' by default.` +
        `\nYou can resolve this warning by explicitly calling 'configure({ testingLibrary: 'react-native' })' or 'configure({ testingLibrary: 'react' })' in your test setup file.`
    );

    return RNTL;
  }

  if (RNTL != null) {
    if (config.verbose) console.log(`Reassure: using '@testing-library/react-native' to render components`);
    return RNTL;
  }

  if (RTL != null) {
    if (config.verbose) console.log(`Reassure: using '@testing-library/react' to render components`);
    return RTL;
  }

  throw new Error(
    `Reassure: unable to import neither '@testing-library/react-native' nor '@testing-library/react'.` +
      `\nAdd either of these testing libraries to your 'package.json'`
  );
}
