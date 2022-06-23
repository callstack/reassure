const defaultConfig = {
  runs: 10,
  dropWorst: 1,
  outputFile: process.env.OUTPUT_FILE ?? '.reassure/current.perf',
  verbose: false,
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
