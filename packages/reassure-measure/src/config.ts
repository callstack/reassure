type Config = {
  runs: number;
  dropWorst: number;
  outputFile: string;
  verbose: boolean;
};

const defaultConfig: Config = {
  runs: 10,
  dropWorst: 1,
  outputFile: process.env.OUTPUT_FILE ?? '.reassure/current.perf',
  verbose: false,
};

export let config = defaultConfig;

export function configure(customConfig: Partial<Config>) {
  config = {
    ...defaultConfig,
    ...customConfig,
  };
}

export function resetToDefault() {
  config = defaultConfig;
}
