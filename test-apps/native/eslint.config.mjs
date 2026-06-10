import { fixupConfigRules } from '@eslint/compat';
import reactNativeConfig from '@react-native/eslint-config/flat';

export default [...fixupConfigRules(reactNativeConfig)];
