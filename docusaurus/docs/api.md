---
title: API
sidebar_position: 4
---

# API

## Measurements

### `measureRenders()` function {#measure-renders}

:::info

Prior to version 1.0, this function has been named `measurePerformance`.

:::

Custom wrapper for the RNTL/RTL's `render` function responsible for rendering the passed screen inside a `React.Profiler` component,
measuring its performance and writing results to the output file. You can use optional `options` object allows customizing aspects
of the testing.

```ts
async function measureRenders(
  ui: React.ReactElement,
  options?: MeasureRendersOptions,
): Promise<MeasureResults> {
```

#### Example {#measure-renders-example}

```ts
// sample.perf-test.tsx
import { measureRenders } from 'reassure';
import { screen, fireEvent } from '@testing-library/react-native';
import { ComponentUnderTest } from './ComponentUnderTest';

test('Test with scenario', async () => {
  const scenario = async () => {
    fireEvent.press(screen.getByText('Go'));
    await screen.findByText('Done');
  };

  await measureRenders(<ComponentUnderTest />, { scenario });
});
```

### `MeasureRendersOptions` type {#measure-renders-options}

```ts
interface MeasureRendersOptions {
  runs?: number;
  warmupRuns?: number;
  wrapper?: React.ComponentType<{ children: ReactElement }>;
  scenario?: (view?: RenderResult) => Promise<any>;
  writeFile?: boolean;
}
```

- **`runs`**: number of runs per series for the particular test
- **`warmupRuns`**: number of additional warmup runs that will be done and discarded before the actual runs.
- **`wrapper`**: React component, such as a `Provider`, which the `ui` will be wrapped with. Note: the render duration of the `wrapper` itself is excluded from the results, only the wrapped component is measured.
- **`scenario`**: a custom async function, which defines user interaction within the ui by utilized RNTL functions
- **`writeFile`**: (default `true`) should write output to file.

### `measureFunction` function {#measure-function}

Allows you to wrap any synchronous function, measure its performance and write results to the output file. You can use optional `options` to customize aspects of the testing.

```ts
async function measureFunction(
  fn: () => void,
  options?: MeasureFunctionOptions,
): Promise<MeasureResults> {
```

#### Example {#measure-function-example}

```ts
// sample.perf-test.tsx
import { measureFunction } from 'reassure';
import { fib } from './fib';

test('fib 30', async () => {
  await measureFunction(() => fib(30));
});
```

### `MeasureFunctionOptions` type {#measure-function-options}

```ts
interface MeasureFunctionOptions {
  runs?: number;
  warmupRuns?: number;
  writeFile?: boolean;
}
```

- **`runs`**: number of runs per series for the particular test
- **`warmupRuns`**: number of additional warmup runs that will be done and discarded before the actual runs.
- **`writeFile`**: (default `true`) should write output to file.

### `measureAsyncFunction` function {#measure-async-function}

Allows you to wrap any asynchronous function, measure its performance and write results to the output file. You can use optional `options` to customize aspects of the testing.

:::info

Measuring performance of asynchronous functions can be tricky. These functions often depend on external conditions like I/O operations, network requests, or storage access, which introduce unpredictable timing variations in your measurements. For stable and meaningful performance metrics, **always ensure all external calls are properly mocked in your test environment to avoid polluting your performance measurements with uncontrollable factors.**

:::

```ts
async function measureAsyncFunction(
  fn: () => Promise<unknown>,
  options?: MeasureAsyncFunctionOptions,
): Promise<MeasureResults> {
```

#### Example {#measure-async-function-example}

```ts
// sample.perf-test.tsx
import { measureAsyncFunction } from 'reassure';
import { fib } from './fib';

test('fib 30', async () => {
  await measureAsyncFunction(async () => {
    return Promise.resolve().then(() => fib(30));
  });
});
```

### `MeasureAsyncFunctionOptions` type {#measure-async-function-options}

```ts
interface MeasureAsyncFunctionOptions {
  runs?: number;
  warmupRuns?: number;
  writeFile?: boolean;
}
```

- **`runs`**: number of runs per series for the particular test
- **`warmupRuns`**: number of additional warmup runs that will be done and discarded before the actual runs.
- **`writeFile`**: (default `true`) should write output to file.

## Configuration

### Default configuration

The default config which will be used by the measuring script. This configuration object can be overridden with the use
of the `configure` function.

```ts
type Config = {
  runs?: number;
  warmupRuns?: number;
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
  warmupRuns: 1,
  outputFile: '.reassure/current.perf',
  verbose: false,
  testingLibrary: undefined, // Will try auto-detect first RNTL, then RTL
};
```

- **`runs`**: number of repeated runs in a series per test (allows for higher accuracy by aggregating more data). Should be handled with care.
- **`warmupRuns`**: number of additional warmup runs that will be done and discarded before the actual runs.
- **`outputFile`**: name of the file the records will be saved to
- **`verbose`**: make Reassure log more, e.g. for debugging purposes
- **`testingLibrary`**: where to look for `render` and `cleanup` functions, supported values `'react-native'`, `'react'` or object providing custom `render` and `cleanup` functions

### `configure` function

```ts
function configure(customConfig: Partial<Config>): void;
```

You can use the `configure` function to override the default config parameters.

#### Example {#configure-example}

```ts
import { configure } from 'reassure';

configure({
  testingLibrary: 'react', // force using React Testing Library internally by Reassure to render and cleanup
  runs: 7, // by default repeat performance tests 7 times
});
```

### `resetToDefaults` function {#reset-to-defaults}

```ts
resetToDefaults(): void
```

Reset current config to the original `defaultConfig` object. You can call `resetToDefaults()` anywhere in your performance test file.

### Environmental variables

The `reassure` CLI can be parametrized using available environmental variables:

- `TEST_RUNNER_PATH`: an alternative path for your test runner. Defaults to `'node_modules/.bin/jest'` or on Windows `'node_modules/jest/bin/jest'`
- `TEST_RUNNER_ARGS`: a set of arguments fed to the runner. Defaults to `'--runInBand --testMatch "**/__perf__/**/*.[jt]s?(x)", "**/*.(perf|perf-test).[jt]s?(x)"`

Example:

```sh
TEST_RUNNER_PATH=myOwnPath/jest/bin yarn reassure
```
