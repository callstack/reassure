module.exports = {
  root: true,
  extends: '@callstack/eslint-config/react',
  rules: {
    // typescript will handle that
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'react/react-in-jsx-scope': 'off',
    'jest/expect-expect': ['error', { assertFunctionNames: ['expect', 'measurePerformance'] }],
  },
};
