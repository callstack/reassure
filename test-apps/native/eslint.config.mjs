import { fixupPluginRules } from '@eslint/compat';
import reactNativeConfig from '@react-native/eslint-config/flat';

function patchLegacyPlugins(configItem) {
  const { plugins } = configItem;
  if (!plugins) {
    return configItem;
  }

  let patchedPlugins = plugins;

  for (const pluginName of ['eslint-comments', 'react', 'react-native']) {
    if (plugins[pluginName]) {
      patchedPlugins =
        patchedPlugins === plugins ? { ...plugins } : patchedPlugins;
      patchedPlugins[pluginName] = fixupPluginRules(plugins[pluginName]);
    }
  }

  return patchedPlugins === plugins
    ? configItem
    : { ...configItem, plugins: patchedPlugins };
}

const patchedReactNativeConfig = reactNativeConfig.map(patchLegacyPlugins);

export default [
  {
    ignores: ['eslint.config.mjs'],
  },
  ...patchedReactNativeConfig,
];
