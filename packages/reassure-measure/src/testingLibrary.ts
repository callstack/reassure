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

export function getRenderFunction(): Render {
  if (config.render) {
    if (config.verbose) console.log(`Reassure: using custom 'render' function.`);
    return config.render;
  }

  if (config.testingLibrary === 'react-native') {
    if (!RNTL) {
      console.error(`Reassure: unable to import '@testing-library/react-native' dependency`);
      throw new Error(`Unable to import '@testing-library/react-native' dependency`);
    }

    if (config.verbose) console.log(`Reassure: using 'render' function from '@testing-library/react-native'`);
    return RNTL.render;
  }

  if (config.testingLibrary === 'react') {
    if (!RTL) {
      console.error(`Reassure: unable to import '@testing-library/react' dependency`);
      throw new Error(`Unable to import '@testing-library/react' dependency`);
    }

    if (config.verbose) console.log(`Reassure: using 'rener' function from '@testing-library/react'`);
    return RTL.render;
  }

  if (config.testingLibrary != null) {
    console.error(
      `Reassure: unsupported 'testingLibrary: "${config.testingLibrary}"' option in 'configure' call. Supported values are 'react-native' and 'react'.`
    );
    throw new Error(`Unsupported 'testingLibrary: "${config.testingLibrary}"' option`);
  }

  if (RNTL != null && RTL != null) {
    console.warn(
      `Reassure: both '@testing-library/react-native' and '@testing-library/react' are installed. Using '@testing-library/react-native' by default.` +
        `\nYou can resolve this warning by explicitly calling 'configure({ testingLibrary: 'react-native' })' or 'configure({ testingLibrary: 'react' })' in your test setup file.`
    );

    return RNTL.cleanup;
  }

  if (RNTL != null) {
    if (config.verbose) console.log(`Reassure: using 'render' function from '@testing-library/react-native'`);
    return RNTL.cleanup;
  }

  if (RTL != null) {
    if (config.verbose) console.log(`Reassure: using 'render' function from '@testing-library/react'`);
    return RTL.cleanup;
  }

  console.error(
    `Reassure: unable to import neither '@testing-library/react-native' nor '@testing-library/react'.` +
      `\nAdd either of these testing libraries to your 'package.json'`
  );
  throw "Unable to import neither '@testing-library/react-native' nor '@testing-library/react'";
}

export function getCleanupFunction(): Cleanup {
  if (config.cleanup) {
    if (config.verbose) console.log(`Reassure: using custom 'cleanup' function`);
    return config.cleanup;
  }

  if (config.testingLibrary === 'react-native') {
    if (!RNTL) {
      console.error(`Reassure: unable to import '@testing-library/react-native' dependency`);
      throw new Error(`Unable to import '@testing-library/react-native' dependency`);
    }

    if (config.verbose) console.log(`Reassure: using 'cleanup' function from '@testing-library/react-native'`);
    return RNTL.cleanup;
  }

  if (config.testingLibrary === 'react') {
    if (!RTL) {
      console.error(`Reassure: unable to import '@testing-library/react' dependency`);
      throw new Error(`Unable to import '@testing-library/react' dependency`);
    }

    if (config.verbose) console.log(`Reassure: using 'cleanup' function from '@testing-library/react'`);
    return RTL.cleanup;
  }

  if (config.testingLibrary != null) {
    console.error(
      `Reassure: unsupported 'testingLibrary: "${config.testingLibrary}"' option in 'configure' call. Supported values are 'react-native' and 'react'.`
    );
    throw new Error(`Unsupported 'testingLibrary: "${config.testingLibrary}"' option`);
  }

  if (RNTL != null && RTL != null) {
    console.warn(
      `Reassure: both '@testing-library/react-native' and '@testing-library/react' are installed. Using '@testing-library/react-native' by default.` +
        `\nYou can resolve this warning by explicitly calling 'configure({ testingLibrary: 'react-native' })' or 'configure({ testingLibrary: 'react' })' in your test setup file.`
    );

    return RNTL.cleanup;
  }

  if (RNTL != null) {
    if (config.verbose) console.log(`Reassure: using 'cleanup' function from '@testing-library/react-native'`);
    return RNTL.cleanup;
  }

  if (RTL != null) {
    if (config.verbose) console.log(`Reassure: using 'cleanup' function from '@testing-library/react'`);
    return RTL.cleanup;
  }

  console.error(
    `Reassure: unable to import neither '@testing-library/react-native' nor '@testing-library/react'.` +
      `\nAdd either of these testing libraries to your 'package.json'`
  );
  throw "Unable to import neither '@testing-library/react-native' nor '@testing-library/react'";
}
