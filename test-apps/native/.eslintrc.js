module.exports = {
  root: true,
  extends: '@callstack/eslint-config',
  rules: {
    'jest/expect-expect': [
      'error',
      {
        assertFunctionNames: ['expect', 'measureRenders', 'measureFunction'],
      },
    ],
  },
  extends: '@react-native',
};
