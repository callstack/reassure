<p align="center">
<img src="./docs/logo.png" width="400px" alt="Reassure" />
</p>
<p align="center">
Performance testing companion for React and React Native.
</p>

---

- [The problem](#the-problem)
- [The solution](#the-solution)
- [Installation and setup](#installation-and-setup)
  - [Writing First Test](#writing-first-test)
    - [Async tests](#async-tests)
  - [Optional: ES Lint setup](#optional-es-lint-setup)
  - [Measuring test performance](#measuring-test-performance)
  - [Write performance testing script](#write-performance-testing-script)
  - [CI integration](#ci-integration)
- [Assessing CI stability](#assessing-ci-stability)
  - [Example output](#example-output)
- [Testing API](#testing-api)
  - [defaultConfig](#defaultconfig)
  - [measureRender](#measurerender)
  - [writeTestStats](#writeteststats)
  - [clearTestStats](#clearteststats)
  - [configure](#configure)
  - [resetToDefault](#resettodefault)
- [Main script](#main-script)
  - [Main script arguments](#main-script-arguments)
- [Compare script](#compare-script)
  - [Compare script arguments](#compare-script-arguments)
  - [Running locally](#running-locally)
- [Danger.js plugin](#dangerjs-plugin)
- [Contributing](#contributing)
- [License](#license)

## The problem

Optimising performance of React Native app is a complicated task, you have to profile the app, observe render patterns,
apply memoization in the right places, etc. The results are frequently impressive, but also fragile. It's very easy to
introduce performance issues, e.g. by breaking carefuly crafted component memoization with seamingly innoncent code.
Especially in a large project, especially with a large team, especially when shipping new features in a fast pace.

On the other hand requireing developers to manually analyse performance as a part of PR review process is not feasible
solution, as it will bring your time to grind.

## The solution

Reassure allows you to automate React Native profiling on CI, or your local machine. The same way you write your 
integration and unit tests that automatically verify that your app is still *working correctly*, you can write
performance tests that verify that your app still *working performantly*. 

Actually, peformance tests writen using Reassure look very similar to integration tests written using
[React Native Testing Library](https://github.com/callstack/react-native-testing-library). That's because we
build Reassure on top of it, so that you can easily re-use your integration test scenarios as performance tests.

Reassure works by measuring render characteristics (render duration and count) of your modified code ("current", 
e.g your PR branch) and comparing that to render characteristics of the stable version of your code ("baseline",
usually your `main` branch). We do it many time to reduce impact of random variations in render times. Then we apply
statistical analysis to figure out whether the code changes have a statistically-signifcant impact, both positive
and negative on any of your performance test scenarios. Finnaly, we generate a easily-readable report summarising
our findings and displaying it on the CI.


## Installation and setup

In order to install Reassure run following command in your app folder:

Using yarn
```
yarn add --dev @reassure/reassure
```

Using npm
```
npm install --save-dev @reassure/reassure
```

You will also need a working [React Native Testing Library](https://github.com/callstack/react-native-testing-library#installation)
and [Jest](https://jestjs.io/docs/getting-started) setup.

### Writing First Test

Next you can write you first test scenario:

```ts
// ComponentUnderTest.perf-test.tsx
import { measurePerformance } from '@reassure/reassure';

test('Simple test', async () => {
  await measurePerformance(<ComponentUnderTest />);
});
```

This test will measure render times of `ComponentUnderTest` during mounting and resulting sync effects.

Your file should have `perf-test.js`/`perf-test.tsx` extensions in order to separate it from regular test files.
Reassure will automatically match test filenames using jest `--testMatch` option with value
 `"<rootDir>/**/*.perf-test.[jt]s?(x)"`.

#### Async tests

If your compoment contains any async logic or you want to test some interaction you should pass `scenario` option:

```ts
import { measurePerformance } from '@reassure/reassure';
import { RenderAPI, fireEvent } from '@testing-library/react-native';

test('Test with scenario', async () => {
  const scenario = async (screen: RenderAPI) => {
    fireEvent.press(screen.getByText('Go'));
    await screen.findByText('Done');
  };

  await measurePerformance(<ComponentUnderTest />, { scenario });
});
```

The body of `scenario` function is using familiar React Native Testing Library methods.

If your test contains any async changes, you will need to make sure that the scenario waits for these changes to settle, e.g. using
`findBy` queries, `waitFor` or `waitForElementToBeRemoved` functions from RNTL.

For more examples look into our [test examples app](https://github.com/callstack-internal/reassure/tree/main/examples/native/src/__tests__).

### Optional: ES Lint setup

ES Lint might require you to have at least one `expect` statement in each of your tests. In order to avoid this requirement
for performance tests you can add following override to your `.eslintrc` file:

```
rules: {
  'jest/expect-expect': [
    'error',
    { assertFunctionNames: ['measurePerformance'] },
  ],
}
```
### Measuring test performance

In order to measure your first test performance you need to run following command in terminal:

```
> reassure measure
```

This command will run your tests multiple times using Jest, gathering render statistics, and will write them to 
`.reassure/current.perf` file. In order to check your setup, check if the output file existis after running the 
command for the first time.

### Write performance testing script

In order to detect performance changes, you need to measure the performance of two versions of your code
current (your modifed code), and baseline (your reference point, e.g. `main` branch). In order to measure performance
on two different branches you need to either switch branches in git or clone two copies of your repository.

We want to automate this task, so it can run on the CI. In order to do that you will need to create a
performance testing script. You should save it in your repository, e.g. as `reassure-tests.sh`.

A simple version of such script, using branch chaning approach is as follows:

```sh
#!/usr/bin/env bash

CURRENT_BRANCH=$(git rev-parse --short HEAD)
BASELINE_BRANCH=${BASELINE_BRANCH:="main"}

# Gather baseline perf measurements
git checkout "$BASELINE_BRANCH";
npx reassure measure --baseline

# Gather current perf measurements
git checkout "$CURRENT_BRANCH";
npx reassure measure

# Compare results
npx reassure compare
```

### CI integration

As a final setup step you need to configure your CI to run the performance testing script and output the result.
For presenting output at the moment we integrate with Danger JS, which supports all major CI tools.

You you will need a working [Danger JS setup](https://danger.systems/js/guides/getting_started.html).

Then add Reassure Danger JS plugin to your dangerfile :
```ts
import path from 'path';
import reassure from './packages/reassure/plugins';

reassure({
  inputFilePath: path.join(__dirname, './examples/native/.reassure/output.md'),
});
```

You can also check our example [Dangerfile](https://github.com/callstack-internal/reassure/blob/main/dangerfile.ts).

Finally run both performance testsing script & danger in your CI config:
```yaml
- name: Run comparative test script
  run: npx reassure-tests

- name: Run danger.js
  uses: danger/danger-js@9.1.6
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

You can also check our example [GitHub workflow](https://github.com/callstack-internal/reassure/blob/main/.github/workflows/main.yml).

## Assessing CI stability

During peformance measurements we measure React component render times in miliseconds, aka wall clock time. This means
that the same code will run faster (less ms) on faster machine and slower (more ms) on slower machine. For this reason,
baseline & current measurements needs to be run on the same machine. Optimally, they should be run one after another.

Moreover, in order to achieve meaningful results your CI agent needs to have stable performance. It does not matter
really if your agent is fast or slow as long as it is consistent in it performance. That's why during the performance
tests the agent should not be used for any other work that might impact measuring render times.

In order to help you assess your machine stability, you can use `reassure check-stability` command. It can be used
both CI and locally.

You can refer to your example [GitHub workflow](https://github.com/callstack-internal/reassure/blob/main/.github/workflows/stability.yml).

### Example output

We output our comparison results in form of markdown. Below you can see an example of such an output:

| Name            | Status            | Render duration change                 | Render count change   |
| --------------- | ----------------- | -------------------------------------- | --------------------- |
| AsyncComponent1 | **INSIGNIFICANT** | **52.2 ms -> 52.1 ms, -0.1 ms, -0.5%** | -                     |
| AsyncComponent2 | **SIGNIFICANT**   | **5.2 ms -> 3.3 ms, -1.9 ms, -36.5%**  | -                     |
| AsyncComponent3 | **MEANINGLESS**   | **16.4 ms -> 17.3 ms, +0.9 ms, +5%**   | -                     |
| AsyncComponent4 | **COUNT_CHANGED** | -                                      | **1 -> 2, +1, +100%** |
| AsyncComponent5 | **ADDED**         | -                                      | -                     |
| AsyncComponent6 | **REMOVED**       | -                                      | -                     |

Looking at the example we can notice certain statuses that are assigned to certain tests:

- **_Significant_** marks a change that is statistically significant and **should** be looked into as it marks a potential performance loss
- **_Meaningless_** marks a change that statistically will not impact the performance
- **_Insignificant_** marks a change that can fall in neither of the above categories of statistical significance
- **_Count changed_** marks a change in render count
- **_Added_** marks a test which does not exist in the baseline branch (the one we compare against)
- **_Removed_** marks a test which exists in baseline but does not exist in the current PR branch

## Testing API

### defaultConfig

The default config which will be used by the measuring script. This configuration object can be overridden with the use
of the `configure` function.

```ts
export const defaultConfig = {
  runs: 10,
  dropWorst: 1,
  outputFile: '.reassure/current.perf',
};
```

**`runs`**: number of repeated runs in a series per test (allows for higher accuracy by aggregating more data). Should be handled with care.

**`dropWorst`**: number of worst dropped results from the series per test (used to remove test run outliers)
dropWorst
**`outputFile`**: name of the file the records will be saved to

### measureRender

Custom wrapper for the RNTL `render` function responsible for rendering the passed screen inside a `React.Profiler` component,
and measuring its performance. However, adding an optional `options` object allows for a more advanced manipulation of the process.

```ts
measureRender(ui: React.ReactElement, options?: 1): Promise<MeasureRenderResult>;
```

**MeasureRenderOptions type**

```ts
interface MeasureRenderOptions {
  name?: string;
  runs?: number;
  dropWorst?: number;
  wrapper?: (node: React.ReactElement) => JSX.Element;
  scenario?: (view: RenderAPI) => Promise<any>;
}
```

- **`name`**: name string used in logs
- **`runs`**: number of runs per series for the particular test (as opposed to a global setting in `defaultConfig`)
- **`dropWorst`**: number of worst runs dropped from a test series (as opposed to a global setting in `defaultConfig`)
- **`wrapper`**: custom JSX wrapper, such as a `<Provider />` component, which the ui needs to be wrapped with
- **`scenario`**: a custom async function, which defines user interaction within the ui by utilised RNTL functions

### writeTestStats

Takes the `stats` generated by the `measureRender` function and writes them under the `name` key to the `outputFilePath`.

```ts
writeTestStats(stats: MeasureRenderResult, name: string, outputFilePath: string = config.outputFile): Promise<void>
```

### clearTestStats

Removes the current output file from the `outputFilePath`. By default, we use the filepath as its specified in the `defaultConfig`

```ts
clearTestStats(outputFilePath: string = config.outputFile): Promise<void>
```

### configure

Overrides the current `defaultConfig` object, by providing a new one allowing for alterations in the config in between tests

```ts
configure(customConfig: typeof defaultConfig): void
```

### resetToDefault

Reset current config to the original `defaultConfig` object

```ts
resetToDefault(): void
```

## Main script

To run the main script of the tool, you need to execute the main binary of the package, with the following command

```shell
npx reassure-tests
```

It will start the full process of running tests, saving intermediary files, swapping branches and generating outputs
to be later digested by Danger using the default settings.

### Main script arguments

- **`--baseline_branch|--baseline-branch`** name of the branch to compare against (DEFAULT: `"main"`)

For example:

```shell
npx reassure-tests --baseline_branch v1.0.0
```

will test branch `v1.1.0` performance results against current PR branch performance results and output all pertinent files.

## Compare script

Node script responsible to comparing two output files from two separate runs of Jest test suites intended to be run on
your PR branch and compare against your main branch.

### Compare script arguments

By default, the compare script is run when `npx reassure-tests` is executed, as a part of the whole process and changing
its parameters is handled by passing parameters to the command itself as described in the [Main Script](#Main-script)
section of this documentation. However, if executed directly, the script accepts the following arguments:

```ts
type ScriptArguments = {
  baselineFilePath: string;
  currentFilePath: string;
  outputFilePath: string;
  output?: 'console' | 'json' | 'markdown' | 'all';
};
```

- **`baselineFilePath`** path to the baseline output file from the target branch (DEFAULT: `.reassure/baseline.perf`)
- **`currentFilePath`** path to the current output file from the PR branch (DEFAULT: `.reassure/current.perf`)
- **`output`** type of the desired output. Can be set to `'console' | 'json' | 'markdown' | 'all'` or left unspecified (DEFAULT: `undefined`)
- **`outputFilePath`** used in case of a `'json'` type output as the destination file path for output file (DEFAULT: `.reassure/output.json`)

### Running locally

To run the compare script locally, follow this steps:

1. Manually checkout to your main branch
2. Run the test suite to generate baseline output file
3. Save your baseline output file under a different name (you then will pass it to the script)
4. Checkout back to your PR branch
5. Run the test suite again generating your current output file
6. Run the following command, providing values for listed arguments

```shell
node "node_modules/@reassure/reassure/lib/commonjs/compare/compare.js" --baselineFilePath="" --currentFilePath=""
```

This will print output to your terminal as well as create an `.reassure/output.json` file in location from which the script had been triggered

## Danger.js plugin

By default, Reassure supports outputting the results of its analyses in PR/MR comment by using [Danger.js](https://danger.systems/js/).

In order to utilise the plugin, besides having danger.js step configured in your CI pipeline config file, you will also need
to call the plugin inside your `dangerfile.(js|ts)`, like such:

```ts
import dangerJs from './plugins';

dangerJs();
```

Additionally, make sure that your danger.js step in CI runs after the performance tests step to assure that the input file
consumed by the plugin had been generated.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
