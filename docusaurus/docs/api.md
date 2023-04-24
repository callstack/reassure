---
title: API
sidebar_position: 4
---

# API

## Measurements

### `measurePerformance` function

Custom wrapper for the RNTL `render` function responsible for rendering the passed screen inside a `React.Profiler` component,
measuring its performance and writing results to the output file. You can use optional `options` object allows customizing aspects
of the testing

```ts
async function measurePerformance(ui: React.ReactElement, options?: MeasureOptions): Promise<MeasureRenderResult> {
```

#### Example

```ts
// sample.perf-test.tsx
import { measurePerformance } from 'reassure';
import { screen, fireEvent } from '@testing-library/react-native';
import { ComponentUnderTest } from './ComponentUnderTest';

test('Test with scenario', async () => {
  const scenario = async () => {
    fireEvent.press(screen.getByText('Go'));
    await screen.findByText('Done');
  };

  await measurePerformance(<ComponentUnderTest />, { scenario });
});
```

### `MeasureOptions` type

```ts
interface MeasureOptions {
  runs?: number;
  dropWorst?: number;
  wrapper?: (node: React.ReactElement) => JSX.Element;
  scenario?: (view?: RenderResult) => Promise<any>;
}
```

- **`runs`**: number of runs per series for the particular test
- **`dropWorst`**: number of worst (highest) runs dropped from a test series
- **`wrapper`**: custom JSX wrapper, such as a `<Provider />` component, which the ui needs to be wrapped with. Note: the render duration of the `wrapper` itself is excluded from the results, only the wrapper component is measured.
- **`scenario`**: a custom async function, which defines user interaction within the ui by utilized RNTL functions

## Configuration

### Default configuration

The default config which will be used by the measuring script. This configuration object can be overridden with the use
of the `configure` function.

```ts
type Config = {
  runs?: number;
  dropWorst?: number;
  outputFile?: string;
  verbose?: boolean;
  testingLibrary?:
    | 'react-native'
    | 'react'
    | { render: (component: React.ReactElement<any>) => any; cleanup: () => any };
};
```

```ts
const defaultConfig: Config = {
  runs: 10,
  dropWorst: 1,
  outputFile: '.reassure/current.perf',
  verbose: false,
  testingLibrary: undefined, // Will try auto-detect first RNTL, then RTL
};
```

**`runs`**: number of repeated runs in a series per test (allows for higher accuracy by aggregating more data). Should be handled with care.
**`dropWorst`**: number of worst dropped results from the series per test (used to remove test run outliers)
**`outputFile`**: name of the file the records will be saved to
**`verbose`**: make Reassure log more, e.g. for debugging purposes
**`testingLibrary`**: where to look for `render` and `cleanup` functions, supported values `'react-native'`, `'react'` or object providing custom `render` and `cleanup` functions

### `configure` function

```ts
function configure(customConfig: Partial<Config>): void;
```

You can use the `configure` function to override the default config parameters.

#### Example

```ts
import { configure } from 'reassure';

configure({
  testingLibrary: 'react', // force using React Testing Library internally by Reassure to render and cleanup
  runs: 7, // by default repeat performance tests 7 times
});
```

### `resetToDefault` function

```ts
resetToDefault(): void
```

Reset current config to the original `defaultConfig` object. You can call `resetToDefault()` anywhere in your performance test file.

### Environmental variables

The `reassure` CLI can be parametrized using available environmental variables:

- `TEST_RUNNER_PATH`: an alternative path for your test runner. Defaults to `'node_modules/.bin/jest'` or on Windows `'node_modules/jest/bin/jest'`
- `TEST_RUNNER_ARGS`: a set of arguments fed to the runner. Defaults to `'--runInBand --testMatch "<rootDir>/**/*.perf-test.[jt]s?(x)"'`

Example:

```sh
TEST_RUNNER_PATH=myOwnPath/jest/bin yarn reassure
```
