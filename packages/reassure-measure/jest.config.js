module.exports = {
  preset: '@testing-library/react-native',
  setupFilesAfterEnv: ['./jest-setup.ts'],
  transformIgnorePatterns: ['node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation)'],
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
  clearMocks: true,
};
