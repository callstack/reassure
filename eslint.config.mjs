import callstackNodeConfig from '@callstack/eslint-config/node.flat.js';
import pluginOxfmt from 'eslint-plugin-oxfmt';

export default [
  {
    ignores: ['docusaurus/**', 'test-apps/**', 'packages/**/lib/**', 'dangerfile.ts'],
  },
  ...callstackNodeConfig,
  { rules: { 'prettier/prettier': 'off' } },
  pluginOxfmt.configs.recommendedWithoutParser,
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
