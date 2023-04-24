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

<p align="center">
  <a href="https://callstack.github.io/reassure/"><b>Read The Docs</b></a>
</p>

---

- [The problem](#the-problem)
- [This solution](#this-solution)
- [Installation and setup](#installation-and-setup)
  - [Writing your first test](#writing-your-first-test)
  - [Measuring test performance](#measuring-test-performance)
  - [Write performance testing script](#write-performance-testing-script)
- [CI setup](#ci-setup)
  - [Options](#options)
  - [Scaffolding](#scaffolding)
  - [CI script (`reassure-tests.sh`)](#ci-script-reassure-testssh-1)
  - [Integration](#integration)
- [Assessing CI stability](#assessing-ci-stability)
- [Analyzing results](#analyzing-results)
- [API](#api)
  - [Measurements](#measurements)
  - [Configuration](#configuration)
- [External References](#external-references)
- [Contributing](#contributing)
- [License](#license)
- [Made with ❤️ at Callstack](#made-with-️-at-callstack)

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

You will also need a working [Jest](https://jestjs.io/docs/getting-started) setup as well as one of either [React Native Testing Library](https://github.com/callstack/react-native-testing-library#installation) or [React Testing Library](https://testing-library.com/docs/react-testing-library/intro).

You can check our example projects:

- [React Native (CLI)](https://github.com/callstack/reassure-examples/tree/main/examples/native)
- [React Native (Expo)](https://github.com/callstack/reassure-examples/tree/main/examples/native-expo)
- [React (Next.js)](https://github.com/callstack/reassure-examples/tree/main/examples/web-nextjs)
- [React (Vite)](https://github.com/callstack/reassure-examples/tree/main/examples/native-expo)

Reassure will try to detect which Testing Library you have installed. In case both React Native Testing Library and React Testing Library are present it will
warn you about that and give a precedence to React Native Testing Library. You can explicitly specify Testing Library to by used by using [`configure`](#configure-function) option:

```
configure({ testingLibrary: 'react-native' })
// or
configure({ testingLibrary: 'react' })
```

You should set it in your Jest setup file and you can override it in particular test files if needed.

### Writing your first test

Now that the library is installed, you can write you first test scenario in a file with `.perf-test.js`/`.perf-test.tsx` extension:

```ts
// ComponentUnderTest.perf-test.tsx
import { measurePerformance } from 'reassure';
import { ComponentUnderTest } from './ComponentUnderTest';

test('Simple test', async () => {
  await measurePerformance(<ComponentUnderTest />);
});
```

This test will measure render times of `ComponentUnderTest` during mounting and resulting sync effects.

> **Note**: Reassure will automatically match test filenames using Jest's `--testMatch` option with value `"<rootDir>/**/*.perf-test.[jt]s?(x)"`. However, if you would like to pass a custom `--testMatch` option, you may add it to the `reassure measure` script in order to pass your own glob. More about `--testMatch` in [Jest docs](https://jestjs.io/docs/configuration#testmatch-arraystring)

#### Writing async tests

If your component contains any async logic or you want to test some interaction you should pass the `scenario` option:

```ts
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

The body of the `scenario` function is using familiar React Native Testing Library methods.

In case of using a version of React Native Testing Library lower than v10.1.0, where [`screen` helper](https://callstack.github.io/react-native-testing-library/docs/api/#screen) is not available, the `scenario` function provides it as its first argument:

```ts
import { measurePerformance } from 'reassure';
import { fireEvent } from '@testing-library/react-native';

test('Test with scenario', async () => {
  const scenario = async (screen) => {
    fireEvent.press(screen.getByText('Go'));
    await screen.findByText('Done');
  };

  await measurePerformance(<ComponentUnderTest />, { scenario });
});
```

If your test contains any async changes, you will need to make sure that the scenario waits for these changes to settle, e.g. using
`findBy` queries, `waitFor` or `waitForElementToBeRemoved` functions from RNTL.

For more examples look into our example apps:

- [React Native (CLI)](https://github.com/callstack/reassure-examples/tree/main/examples/native)
- [React Native (Expo)](https://github.com/callstack/reassure-examples/tree/main/examples/native-expo)
- [React (Next.js)](https://github.com/callstack/reassure-examples/tree/main/examples/web-nextjs)
- [React (Vite)](https://github.com/callstack/reassure-examples/tree/main/examples/native-expo)

### Measuring test performance

In order to measure your first test performance you need to run following command in terminal:

```sh
yarn reassure
```

This command will run your tests multiple times using Jest, gathering render statistics, and will write them to
`.reassure/current.perf` file. In order to check your setup, check if the output file exists after running the
command for the first time.

> **Note:** You can add `.reassure/` folder to your `.gitignore` file to avoid accidentally committing your results.

Reassure CLI will automatically try to detect your source code branch name and commit hash when you are using Git. You can override these options, e.g. if you are using different version control system:

```sh
yarn reassure --branch [branch name] --commit-hash [commit hash]
```

### Write performance testing script

In order to detect performance changes, you need to measure the performance of two versions of your code
current (your modified code), and baseline (your reference point, e.g. `main` branch). In order to measure performance
on two different branches you need to either switch branches in git or clone two copies of your repository.

We want to automate this task, so it can run on the CI. In order to do that you will need to create a
performance testing script. You should save it in your repository, e.g. as `reassure-tests.sh`.

A simple version of such script, using branch changing approach is as follows:

```sh
#!/usr/bin/env bash
set -e

BASELINE_BRANCH=${BASELINE_BRANCH:="main"}

# Required for `git switch` on CI
git fetch origin

# Gather baseline perf measurements
git switch "$BASELINE_BRANCH"
yarn install --force
yarn reassure --baseline

# Gather current perf measurements & compare results
git switch --detach -
yarn install --force
yarn reassure
```

## CI setup

To make setting up the CI integration and all prerequisites more convenient, we have prepared a CLI command which will generate all necessary templates for you to get started with.

Simply run:

```bash
yarn reassure init
```

This will generate the following file structure

```
├── <ROOT>
│   ├── reassure-tests.sh
│   ├── dangerfile.ts/js (or dangerfile.reassure.ts/js if dangerfile.ts/js already present)
│   └── .gitignore
```

### Options

You can also use the following options in order to further adjust the script

#### `--verbose` (optional)

This is one of the options controlling the level of logs printed into the command prompt while running reassure scripts. It will

#### `--silent` (optional)

Just like the previous, this option also controls the level of logs. It will suppress all logs besides explicit errors.

### Scaffolding

#### CI Script (`reassure-tests.sh`)

Basic script allowing you to run Reassure on CI. More on the importance and structure of this file in the following section.

#### Dangerfile

If your project already contains a `dangerfile.ts/js`, the CLI will not override it in any way. Instead, it will generate a `dangerfile.reassure.ts/js` file which will allow you to compare and update your own at your own convenience.

#### `.gitignore`

If .gitignore file is present and no mentions of `reassure` appear within it, the script will append the `.reassure/` directory to its end.

### CI script (`reassure-tests.sh`)

In order to detect performance changes, you need to measure the performance of two versions of your code
current (your modified code), and baseline (your reference point, e.g. `main` branch). In order to measure performance
on two different branches you need to either switch branches in git or clone two copies of your repository.

We want to automate this task, so it can run on the CI. In order to do that you will need to create a
performance testing script. You should save it in your repository, e.g. as `reassure-tests.sh`.

A simple version of such script, using branch changing approach is as follows:

```sh
#!/usr/bin/env bash
set -e

BASELINE_BRANCH=${BASELINE_BRANCH:="main"}

# Required for `git switch` on CI
git fetch origin

# Gather baseline perf measurements
git switch "$BASELINE_BRANCH"
yarn install --force
yarn reassure --baseline

# Gather current perf measurements & compare results
git switch --detach -
yarn install --force
yarn reassure
```

### Integration

As a final setup step you need to configure your CI to run the performance testing script and output the result.
For presenting output at the moment we integrate with Danger JS, which supports all major CI tools.

#### Updating existing Dangerfile

You will need a working [Danger JS setup](https://danger.systems/js/guides/getting_started.html).

Then add Reassure Danger JS plugin to your dangerfile :

```ts
// /<project_root>/dangerfile.reassure.ts (generated by the init script)

import path from 'path';
import { dangerReassure } from 'reassure';

dangerReassure({
  inputFilePath: path.join(__dirname, '.reassure/output.md'),
});
```

#### Creating Dangerfile

If you do not have a Dangerfile (`dangerfile.js` or `dangerfile.ts`) yet, you can use the one generated by the `reassure init` script without making any additional changes.

You can also find it in our example file [Dangerfile](https://github.com/callstack/reassure/blob/main/dangerfile.ts).

#### Updating the CI configuration file

Finally run both performance testing script & danger in your CI config:

```yaml
- name: Run performance testing script
  run: ./reassure-tests.sh

- name: Run Danger.js
  run: yarn danger ci
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

You can also check our example [GitHub workflow](https://github.com/callstack/reassure/blob/main/.github/workflows/main.yml).

The above example is based on GitHub Actions, but it should be similar to other CI config files and should only serve as a reference in such cases.

> **Note**: Your performance test will run much longer than regular integration tests. It's because we run each test scenario multiple times (by default 10), and we repeat that for two branches of your code. Hence, each test will run 20 times by default. That's unless you increase that number even higher.

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
async function measurePerformance(ui: React.ReactElement, options?: MeasureOptions): Promise<MeasureRenderResult> {
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
- **`wrapper`**: custom JSX wrapper, such as a `<Provider />` component, which the ui needs to be wrapped with. Note: the render duration of the `wrapper` itself is excluded from the results, only the wrapped component is measured.
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

- `TEST_RUNNER_PATH`: an alternative path for your test runner. Defaults to `'node_modules/.bin/jest'` or on Windows `'node_modules/jest/bin/jest'`
- `TEST_RUNNER_ARGS`: a set of arguments fed to the runner. Defaults to `'--runInBand --testMatch "<rootDir>/**/*.perf-test.[jt]s?(x)"'`

Example:

```sh
TEST_RUNNER_PATH=myOwnPath/jest/bin yarn reassure
```

## External References

- [The Ultimate Guide to React Native Optimization 2023 Edition](https://www.callstack.com/campaigns/download-the-ultimate-guide-to-react-native-optimization?utm_campaign=RN_Performance&utm_source=readme_reassure) - Mentioned in "Make your app consistently fast" chapter.

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
