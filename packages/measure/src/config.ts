export type TestingLibrary = 'react' | 'react-native' | { render: Render; cleanup: Cleanup };

export type Render = (component: React.ReactElement<any>) => any;
export type Cleanup = () => void;

type Config = {
  runs: number;
  warmupRuns: number;
  removeOutliers: boolean;
  outputFile: string;
  testingLibrary?: TestingLibrary;
};

const defaultConfig: Config = {
  runs: 10,
  warmupRuns: 1,
  removeOutliers: true,
  outputFile: process.env.REASSURE_OUTPUT_FILE ?? '.reassure/current.perf',
  testingLibrary: undefined,
};

export let config = defaultConfig;

export function configure(customConfig: Partial<Config>) {
  config = {
    ...defaultConfig,
    ...customConfig,
  };
}

export function resetToDefaults() {
  config = defaultConfig;
}
