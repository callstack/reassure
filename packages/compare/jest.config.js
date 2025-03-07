module.exports = {
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
  snapshotSerializers: ['@relmify/jest-serializer-strip-ansi/always'],
  clearMocks: true,
};
