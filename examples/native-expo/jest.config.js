module.exports = {
  preset: '@testing-library/react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', './jest-setup.js'],
};
