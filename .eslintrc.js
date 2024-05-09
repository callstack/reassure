module.exports = {
  extends: '@callstack/eslint-config/node',
  rules: {
    'require-await': 'error',
  },
  ignorePatterns: ['docusaurus/**', 'test-apps/**'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: './packages/**/tsconfig.json',
      },
    },
  ],
};
