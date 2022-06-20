export const defaultConfig = {
  runs: 10,
  dropWorst: 1,
  outputFile: 'perf-results.txt',
};

export let config = defaultConfig;

export function configure(customConfig: typeof defaultConfig) {
  config = {
    ...defaultConfig,
    ...customConfig,
  };
}

export function resetToDefault() {
  config = defaultConfig;
}
