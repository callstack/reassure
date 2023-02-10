export type TestingLibrary = 'react' | 'react-native' | { render: Render; cleanup: Cleanup };

export type Render = (component: React.ReactElement<any>) => any;
export type Cleanup = () => void;

type Config = {
  runs: number;
  dropWorst: number;
  outputFile: string;
  testingLibrary?: TestingLibrary;
};

const defaultConfig: Config = {
  runs: 10,
  dropWorst: 1,
  outputFile: process.env.OUTPUT_FILE ?? '.reassure/current.perf',
  testingLibrary: undefined,
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
