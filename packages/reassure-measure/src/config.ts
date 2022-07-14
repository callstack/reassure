type Render = (component: React.ReactElement<any>) => any;
type Cleanup = () => void;

let defaultRender;
let defaultCleanup;

try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const RNTL = require('@testing-library/react-native');
  defaultRender = RNTL.render;
  defaultCleanup = RNTL.cleanup;
} catch (error) {
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    const RTL = require('@testing-library/react');
    defaultRender = RTL.render;
    defaultCleanup = RTL.cleanup;
  } catch (error) {
    console.warn("Reassure: couldn't find neither @testing-library/react-native nor @testing-library/react");
  }
}

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
  render: defaultRender,
  cleanup: defaultCleanup,
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
