import { configure } from 'reassure';

configure({
  testingLibrary: 'react-native',
  verbose: true,
});

beforeAll(() => {
  const React = require('react');
  // __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE IS the
  // ReactSharedInternals object — the same reference React reads internally.
  const internals =
    React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  if (internals != null && 'recentlyCreatedOwnerStacks' in internals) {
    Object.defineProperty(internals, 'recentlyCreatedOwnerStacks', {
      get: () => Infinity,
      set: () => {},
      configurable: true,
    });
  }

  delete console.createTask;
});