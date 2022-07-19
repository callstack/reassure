export type TestingLibrary = 'react' | 'react-native';

export type Render = (component: React.ReactElement<any>) => any;
export type Cleanup = () => void;

type Config = {
  runs: number;
  dropWorst: number;
  outputFile: string;
  verbose: boolean;
  testingLibrary?: TestingLibrary;
  render?: Render;
  cleanup?: Cleanup;
};

const defaultConfig: Config = {
  runs: 10,
  dropWorst: 1,
  outputFile: process.env.OUTPUT_FILE ?? '.reassure/current.perf',
  verbose: false,
  testingLibrary: undefined,
  render: undefined,
  cleanup: undefined,
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
