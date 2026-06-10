import callstackNodeConfig from '@callstack/eslint-config/node.flat.js';

export default [
  {
    ignores: ['docusaurus/**', 'test-apps/**', 'packages/**/lib/**', 'dangerfile.ts'],
  },
  ...callstackNodeConfig,
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
