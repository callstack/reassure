module.exports = {
  root: true,
  extends: '@callstack/eslint-config',
  rules: {
    // typescript will handle that
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'jest/expect-expect': [
      'error',
      { assertFunctionNames: ['expect', 'measurePerformance'] },
    ],
  },
};
