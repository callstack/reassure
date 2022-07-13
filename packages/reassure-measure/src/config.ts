type Render = (component: React.ReactElement<any>) => any;
type Cleanup = () => void;

const RNTL = require('@testing-library/react-native');

type Config = {
  runs: number;
  dropWorst: number;
  outputFile: string;
  verbose: boolean;
  render?: Render;
  cleanup?: Cleanup;
};

const defaultConfig: Config = {
  runs: 10,
  dropWorst: 1,
  outputFile: process.env.OUTPUT_FILE ?? '.reassure/current.perf',
  verbose: false,
  render: RNTL?.render,
  cleanup: RNTL?.cleanup,
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
