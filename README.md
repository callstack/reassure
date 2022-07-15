<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/callstack/reassure/raw/main/packages/reassure/docs/logo-dark.png">
    <img src="https://github.com/callstack/reassure/raw/main/packages/reassure/docs/logo.png" width="400px" alt="Reassure" />
  </picture>
</p>
<p align="center">Performance testing companion for React and React Native.</p>
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/callstack/reassure/raw/main/packages/reassure/docs/callstack-x-entain-dark.png">
    <img src="https://github.com/callstack/reassure/raw/main/packages/reassure/docs/callstack-x-entain.png" width="327px" alt="Callstack x Entain" />
  </picture>
</p>

---

- [The problem](#the-problem)
- [This solution](#this-solution)
- [Installation and setup](#installation-and-setup)
  - [Writing your first test](#writing-your-first-test)
    - [Writing async tests](#writing-async-tests)
  - [Measuring test performance](#measuring-test-performance)
  - [Write performance testing script](#write-performance-testing-script)
  - [CI integration](#ci-integration)
  - [Optional: ESLint setup](#optional-eslint-setup)
- [Assessing CI stability](#assessing-ci-stability)
- [Analyzing results](#analyzing-results)
- [API](#api)
  - [Measurements](#measurements)
    - [`measurePerformance` function](#measureperformance-function)
    - [`MeasureOptions` type](#measureoptions-type)
  - [Configuration](#configuration)
    - [Default configuration](#default-configuration)
    - [`configure` function](#configure-function)
    - [`resetToDefault` function](#resettodefault-function)
    - [Environmental variables](#environmental-variables)
- [Contributing](#contributing)
- [License](#license)
- [Made with ❤️ at Callstack](#made-with-️-at-callstack)

> **Note**: Web support for React apps is coming soon.

## The problem

You want your React Native app to perform well and fast at all times. As a part of this goal, you profile the app, observe render patterns, apply memoization in the right places, etc. But it's all manual and too easy to unintentionally introduce performance regressions that would only get caught during QA or worse, by your users.

## This solution

Reassure allows you to automate React Native app performance regression testing on CI or a local machine. The same way you write your
integration and unit tests that automatically verify that your app is still _working correctly_, you can write
performance tests that verify that your app still _working performantly_.

You can think about it as a React performance testing library. In fact, Reassure is designed to reuse as much of your [React Native Testing Library](https://github.com/callstack/react-native-testing-library) tests and setup as possible.

Reassure works by measuring render characteristics – duration and count – of the testing scenario you provide and comparing that to the stable version. It repeates the scenario multiple times to reduce impact of random variations in render times caused by the runtime environment. Then it applies statistical analysis to figure out whether the code changes are statistically significant or not. As a result, it generates a human-readable report summarizing the results and displays it on the CI or as a comment to your pull request.

## Installation and setup

In order to install Reassure run following command in your app folder:

Using yarn

```sh
yarn add --dev reassure
```

Using npm

```sh
npm install --save-dev reassure
```

You will also need a working [React Native Testing Library](https://github.com/callstack/react-native-testing-library#installation) and [Jest](https://jestjs.io/docs/getting-started) setup.

You can check our example projects:
- [React Native (CLI)](https://github.com/callstack/reassure/tree/main/examples/native)
- [React Native (Expo)](https://github.com/callstack/reassure/tree/main/examples/native-expo)

### Writing your first test

Now that the library is installed, you can write you first test scenario in a file with `.perf-test.js`/`.perf-test.tsx` extension:

```ts
// ComponentUnderTest.perf-test.tsx
import { measurePerformance } from 'reassure';

test('Simple test', async () => {
  await measurePerformance(<ComponentUnderTest />);
});
```

This test will measure render times of `ComponentUnderTest` during mounting and resulting sync effects.

> **Note**: Reassure will automatically match test filenames using Jest's `--testMatch` option with value `"<rootDir>/**/*.perf-test.[jt]s?(x)"`.

#### Writing async tests

If your component contains any async logic or you want to test some interaction you should pass the `scenario` option:

```ts
import { measurePerformance } from 'reassure';
import { screen, fireEvent } from '@testing-library/react-native';

test('Test with scenario', async () => {
  const scenario = async () => {
    fireEvent.press(screen.getByText('Go'));
    await screen.findByText('Done');
  };

  await measurePerformance(<ComponentUnderTest />, { scenario });
});
```

The body of the `scenario` function is using familiar React Native Testing Library methods.

If your test contains any async changes, you will need to make sure that the scenario waits for these changes to settle, e.g. using
`findBy` queries, `waitFor` or `waitForElementToBeRemoved` functions from RNTL.

For more examples look into our [test example app](https://github.com/callstack/reassure/tree/main/examples/native/src/__tests__).

### Measuring test performance

In order to measure your first test performance you need to run following command in terminal:

```sh
yarn reassure
```

This command will run your tests multiple times using Jest, gathering render statistics, and will write them to
`.reassure/current.perf` file. In order to check your setup, check if the output file exists after running the
command for the first time.

> **Note:** You can add `.reassure/` folder to your `.gitignore` file to avoid accidentally committing your results.

### Write performance testing script

In order to detect performance changes, you need to measure the performance of two versions of your code
current (your modified code), and baseline (your reference point, e.g. `main` branch). In order to measure performance
on two different branches you need to either switch branches in git or clone two copies of your repository.

We want to automate this task, so it can run on the CI. In order to do that you will need to create a
performance testing script. You should save it in your repository, e.g. as `reassure-tests.sh`.

A simple version of such script, using branch changing approach is as follows:

```sh
#!/usr/bin/env bash
BASELINE_BRANCH=${BASELINE_BRANCH:="main"}

# Gather baseline perf measurements
git switch "$BASELINE_BRANCH"
npx reassure --baseline

# Gather current perf measurements & compare results
git switch -
npx reassure
```

### CI integration

As a final setup step you need to configure your CI to run the performance testing script and output the result.
For presenting output at the moment we integrate with Danger JS, which supports all major CI tools.

You will need a working [Danger JS setup](https://danger.systems/js/guides/getting_started.html).

Then add Reassure Danger JS plugin to your dangerfile :

```ts
import path from 'path';
import reassureDangerPlugin from 'reassure/plugins';

reassureDangerPlugin({
  inputFilePath: path.join(__dirname, '.reassure/output.md'),
});
```

You can also check our example [Dangerfile](https://github.com/callstack/reassure/blob/main/dangerfile.ts).

Finally run both performance testing script & danger in your CI config:

```yaml
- name: Run performance testing script
 run: ./reassure-tests.sh

- name: Run danger.js
 uses: danger/danger-js@9.1.6
 env:
 GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

You can also check our example [GitHub workflow](https://github.com/callstack/reassure/blob/main/.github/workflows/main.yml).

> **Note**: Your performance test will run much longer than regular integration tests. It's because we run each test scenario multiple times (by default 10), and we repeat that for two branches of your code. Hence, each test will run 20 times by default. That's unless you increase that number even higher.

### Optional: ESLint setup

ESLint might require you to have at least one `expect` statement in each of your tests. In order to avoid this requirement
for performance tests you can add following override to your `.eslintrc` file:

```js
rules: {
 'jest/expect-expect': [
 'error',
    { assertFunctionNames: ['expect', 'measurePerformance'] },
  ],
}
```

## Assessing CI stability

During performance measurements we measure React component render times with microsecond precision using `React.Profiler`. This means
that the same code will run faster or slower depending on the machine. For this reason,
baseline & current measurements need to be run on the same machine. Optimally, they should be run one after another.

Moreover, in order to achieve meaningful results your CI agent needs to have stable performance. It does not matter
really if your agent is fast or slow as long as it is consistent in its performance. That's why during the performance
tests the agent should not be used for any other work that might impact measuring render times.

In order to help you assess your machine stability, you can use `reassure check-stability` command. It runs performance
measurements twice for the current code, so baseline and current measurements refer to the same code. In such case the
expected changes are 0% (no change). The degree of random performance changes will reflect the stability of your machine.
This command can be run both on CI and local machines.

Normally, the random changes should be below 5%. Results of 10% and more considered too high and mean that you should
work on tweaking your machine stability.

> **Note**: As a trick of last resort you can increase the `run` option, from the default value of 10 to 20, 50 or even 100, for all or some of your tests, based on the assumption that more test runs will even out measurement fluctuations. That will however make your tests run even longer.

You can refer to our example [GitHub workflow](https://github.com/callstack/reassure/blob/main/.github/workflows/stability.yml).

## Analyzing results

<p align="center">
<img src="https://github.com/callstack/reassure/raw/main/packages/reassure/docs/report-markdown.png" width="920px" alt="Markdown report" />
</p>

Looking at the example you can notice that test scenarios can be assigned to certain categories:

- **Significant Changes To Render Duration** shows test scenario where the change is statistically significant and **should** be looked into as it marks a potential performance loss/improvement
- **Meaningless Changes To Render Duration** shows test scenarios where the change is not stastatistically significant
- **Changes To Render Count** shows test scenarios where render count did change
- **Added Scenarios** shows test scenarios which do not exist in the baseline measurements
- **Removed Scenarios** shows test scenarios which do not exist in the current measurements

## API

### Measurements

#### `measurePerformance` function

Custom wrapper for the RNTL `render` function responsible for rendering the passed screen inside a `React.Profiler` component,
measuring its performance and writing results to the output file. You can use optional `options` object allows customizing aspects
of the testing

```ts
async function measureRender(ui: React.ReactElement, options?: MeasureOptions): Promise<MeasureRenderResult> {
```

#### `MeasureOptions` type

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
- **`wrapper`**: custom JSX wrapper, such as a `<Provider />` component, which the ui needs to be wrapped with
- **`scenario`**: a custom async function, which defines user interaction within the ui by utilized RNTL functions

### Configuration

#### Default configuration

The default config which will be used by the measuring script. This configuration object can be overridden with the use
of the `configure` function.

```ts
type Config = {
  runs?: number;
  dropWorst?: number;
  outputFile?: string;
  verbose?: boolean;
  render?: typeof render;
};
```

```ts
const defaultConfig: Config = {
  runs: 10,
  dropWorst: 1,
  outputFile: '.reassure/current.perf',
  verbose: false,
  render, // render fn from RNTL
};
```

**`runs`**: number of repeated runs in a series per test (allows for higher accuracy by aggregating more data). Should be handled with care.
**`dropWorst`**: number of worst dropped results from the series per test (used to remove test run outliers)
dropWorst
**`outputFile`**: name of the file the records will be saved to
**`verbose`**: make Reassure log more, e.g. for debugging purposes
**`render`**: your custom `render` function used to render React components

#### `configure` function

```ts
function configure(customConfig: Partial<Config>): void;
```

You can use the `configure` function to override the default config parameters.

#### `resetToDefault` function

```ts
resetToDefault(): void
```

Reset current config to the original `defaultConfig` object

#### Environmental variables

You can use available environmental variables in order to alter your test runner settings.

- `TEST_RUNNER_PATH`: an alternative path for your test runner. Defaults to `'node_modules/.bin/jest'`
- `TEST_RUNNER_ARGS`: a set of arguments fed to the runner. Defaults to `'--runInBand --testMatch "<rootDir>/**/*.perf-test.[jt]s?(x)"'`

Example:

```sh
TEST_RUNNER_PATH=myOwnPath/jest/bin yarn reassure
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

[MIT](./LICENSE)

## Made with ❤️ at Callstack

Reassure is an Open Source project and will always remain free to use. The project has been developed in close
partnership with [Entain](https://entaingroup.com/) and was originally their in-house project. Thanks to their
willingness to develop the React & React Native ecosystem, we decided to make it Open Source. If you think it's cool, please star it 🌟

Callstack is a group of React and React Native experts. If you need any help with these or just want to say hi, contact us at hello@callstack.com!

Like the project? ⚛️ [Join the Callstack team](https://callstack.com/careers/?utm_campaign=Senior_RN&utm_source=github&utm_medium=readme) who does amazing stuff for clients and drives React Native Open Source! 🔥
