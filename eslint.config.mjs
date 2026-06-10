import callstackNodeConfig from '@callstack/eslint-config/node.flat.js';

const nodeConfigWithoutBabelParser = callstackNodeConfig.filter(
  (configItem) =>
    !(
      configItem.files?.includes('**/*.js') &&
      configItem.files?.includes('**/*.jsx') &&
      configItem.languageOptions?.parser
    )
);

export default [
  {
    ignores: ['docusaurus/**', 'test-apps/**', 'packages/**/lib/**', 'dangerfile.ts'],
  },
  ...nodeConfigWithoutBabelParser,
  {
    files: ['*.config.js', '.*.js', 'packages/**/{babel,jest}.config.js'],
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
  {
    rules: {
      'require-await': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './packages/**/tsconfig.json',
      },
    },
  },
];
