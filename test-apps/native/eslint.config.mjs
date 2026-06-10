import { fixupPluginRules } from '@eslint/compat';
import reactNativeConfig from '@react-native/eslint-config/flat';

const patchedReactNativeConfig = reactNativeConfig
  .filter(
    (configItem) =>
      !(
        configItem.files?.includes('**/*.js') &&
        configItem.languageOptions?.parser
      ) && !configItem.files?.includes('**/*.jsx')
  )
  .map((configItem) => {
    if (
      !configItem.plugins?.['eslint-comments'] &&
      !configItem.plugins?.react &&
      !configItem.plugins?.['react-native']
    ) {
      return configItem;
    }

    return {
      ...configItem,
      plugins: {
        ...configItem.plugins,
        ...(configItem.plugins['eslint-comments'] && {
          'eslint-comments': fixupPluginRules(configItem.plugins['eslint-comments']),
        }),
        ...(configItem.plugins.react && {
          react: fixupPluginRules(configItem.plugins.react),
        }),
        ...(configItem.plugins['react-native'] && {
          'react-native': fixupPluginRules(configItem.plugins['react-native']),
        }),
      },
    };
  });

export default [
  {
    ignores: ['eslint.config.mjs'],
  },
  ...patchedReactNativeConfig,
];
