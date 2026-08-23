module.exports = {
  rootDir: '..',
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'babel-jest',
      {
        presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-typescript'],
      },
    ],
  },
};
