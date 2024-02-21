module.exports = {
  preset: '@testing-library/react-native',
  transformIgnorePatterns: ['node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation)'],
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
  snapshotSerializers: ['@relmify/jest-serializer-strip-ansi/always'],
  clearMocks: true,
};
