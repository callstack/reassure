import { fixupConfigRules } from '@eslint/compat';
import reactNativeConfig from '@react-native/eslint-config/flat';
import pluginOxfmt from 'eslint-plugin-oxfmt';

export default [
  ...fixupConfigRules(reactNativeConfig),
  { rules: { 'prettier/prettier': 'off' } },
  pluginOxfmt.configs.recommendedWithoutParser,
];
