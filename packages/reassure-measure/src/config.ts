import type { render as RntlRender } from '@testing-library/react-native';

let render;

try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  render = require('@testing-library/react-native').render;
} catch {
  // TODO add web support
  throw new Error('Reassure requires `@testing-library/react-native` to be installed');
}

type Config = {
  runs: number;
  dropWorst: number;
  outputFile: string;
  verbose: boolean;
  render: typeof RntlRender;
};

const defaultConfig: Config = {
  runs: 10,
  dropWorst: 1,
  outputFile: process.env.OUTPUT_FILE ?? '.reassure/current.perf',
  verbose: false,
  render,
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
