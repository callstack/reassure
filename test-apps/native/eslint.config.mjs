import { fixupConfigRules } from '@eslint/compat';
import reactNativeConfig from '@react-native/eslint-config/flat';

export default [
  {
    ignores: ['eslint.config.mjs'],
  },
  ...fixupConfigRules(reactNativeConfig),
];
