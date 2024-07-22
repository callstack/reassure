import * as logger from '@callstack/reassure-logger';
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
  // Explicit testing library option
  if (config.testingLibrary) {
    if (config.testingLibrary === 'react-native') {
      if (!RNTL) {
        throw new Error(`Unable to import '@testing-library/react-native' dependency`);
      }

      logger.verbose(`Using '@testing-library/react-native' to render components`);
      return RNTL;
    }

    if (config.testingLibrary === 'react') {
      if (!RTL) {
        throw new Error(`Unable to import '@testing-library/react' dependency`);
      }

      logger.verbose(`Using '@testing-library/react' to render components`);
      return RTL;
    }

    if (
      typeof config.testingLibrary === 'object' &&
      typeof config.testingLibrary.render === 'function' &&
      typeof config.testingLibrary.cleanup === 'function'
    ) {
      logger.verbose(`Using custom 'render' and 'cleanup' functions to render components`);
      return config.testingLibrary;
    }

    throw new Error(
      `Unsupported 'testingLibrary' value. Please set 'testingLibrary' to one of following values: 'react-native', 'react' or { render, cleanup }.`
    );
  }

  // Testing library auto-detection
  if (RNTL != null && RTL != null) {
    logger.warn(
      "Both '@testing-library/react-native' and '@testing-library/react' are installed. Using '@testing-library/react-native' by default.\n\nYou can resolve this warning by explicitly calling 'configure({ testingLibrary: 'react-native' })' or 'configure({ testingLibrary: 'react' })' in your test setup file."
    );

    return RNTL;
  }

  if (RNTL != null) {
    logger.verbose(`Using '@testing-library/react-native' to render components`);
    return RNTL;
  }

  if (RTL != null) {
    logger.verbose(`Using '@testing-library/react' to render components`);
    return RTL;
  }

  throw new Error(
    `Unable to import neither '@testing-library/react-native' nor '@testing-library/react'.` +
      `\nAdd either of these testing libraries to your 'package.json'`
  );
}

export function getTestingLibrary(): string | null {
  if (typeof config.testingLibrary === 'string') {
    return config.testingLibrary;
  }

  if (RNTL != null) {
    return 'react-native';
  }

  if (RTL != null) {
    return 'react';
  }

  return null;
}
