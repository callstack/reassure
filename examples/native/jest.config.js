/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {
  setupFilesAfterEnv: ['./jestSetup.js'],
  preset: '@testing-library/react-native',
  clearMocks: true,
};
