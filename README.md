# rn-perf-tool

- [Installation and setup](#Installation-and-setup)
  - [Installing NPM package](#Installing-NPM-package)
  - [Adding CI step](#Adding-CI-step)
    - [Comparing against custom branch](#Comparing-against-custom-branch)
  - [Configuring dangerfile](#Configuring-dangerfile)
- [Writing performance tests](#writing-performance-tests)
  - [Defining file structure](#Defining-file-structure)
  - [My first perf test!](#My-first-perf-test!)
  - [Testing scenarios](#Testing-scenarios)
  - [Testing tests in development environment](#Testing-tests-in-development-environment)
- [Testing API](#Testing-API)
  - [defaultConfig](#defaultconfig)
  - [measureRender](#measurerender)
  - [clearTestStats](#clearteststats)
  - [writeTestStats](#writeteststats)
  - [configure](#configure)
  - [resetToDefault](#resettodefault)
- [Main script](#Main-script)
  - [Main script arguments](#Main-script-arguments)
- [Analyser script](#Analyser-script)
  - [Analyser script arguments](#Analyser-script-arguments)
  - [Running locally](#Running-locally)
- [Danger.js plugin](#Danger.js-plugin)
- [Contributing](#Contributing)
- [Licence](#Licence)

This toolset has been created in order to solve the issue of introducing performance regressions into a
React Native application codebase, by being able to test performance changes in a given CI pipeline
and pinpoint any performance drops, should they arise.

We achieve this, by running suites of specially prepared performance tests, imitating real life user interactions and
running them on two branches (feature branch and repository's main branch), one after the other. Then, we compare
the results we received and calculate statistical data for each test. Lastly, the analysis is printed out and passed
onto a specific plugin (dangerJs by default), to be printed out in given PR's comment or be handled otherwise.

## Installation and setup

There are a couple of steps that are required for the proper setup. Additionally, even though we do our best
to provide valid template of a set, be advised that the CI step will need to be configured on the codebase's side,
just like your `dangerfile.(ts|js)` if you are opting for using Danger plugin.

For the purposes of this explanation, we will use GitHub Actions for CI setup and Danger.js plugin for outputting
our results to demonstrate how to set up the toolset.

### Installing NPM package

```sh
yarn add git+https://github.com/callstack-internal/rn-perf-tool
```

### Adding CI step

Lines below should be added right before the danger step in the CI confg file:

```yaml
- name: Run comparative test script
  run: npx rn-perf-tests
```

Together with dangerJs setup, in case of GitHub Actions, it could look something like this:

```yaml
- name: Run comparative test script
  run: npx rn-perf-tests

- name: Run danger.js
  uses: danger/danger-js@9.1.6
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Comparing against custom branch

Bear in mind that, by default, the tool will be comparing results from your current branch (PR branch)
against results from branch `main`.

In order to change that behavior you need to pass the `base_branch` argument to your CI step, e.g.:

```yaml
- name: Run comparative test script
  run: npx rn-perf-tests --base_branch lts
```

With this, each current test run will be compared against test runs made in branch `lts`.

### Configuring dangerfile

Danger only requires importing the danger plugin and executing it inside your dangerfile, like such:

```ts
import dangerJs from './plugins';

dangerJs();
```

This basic setup will allow you to run the toolset based on your pipeline setup, ideally every time a PR is created for
your repository.

## Writing performance tests

### Defining file structure

rn-perf-tool will automatically look for and run test files which names end with `.perf.(test|spec).(js|jsx|ts}tsx)`.
We encourage placing your performance tests either next to your existing tests or in their own separate folders, e.g.

```
-- screens
 | -- Home
    | -- Home.tsx
    | -- __tests__
       | -- Home.test.tsx
       | -- Home.perf.test.tsx
```

or alternatively:

```
-- screens
 | -- Home
    | -- Home.tsx
    | -- __tests__
       | -- Home.test.tsx
    | -- __perf__
       | -- Home.perf.test.tsx
```

### My first perf test!

rn-perf-tool uses Jest in order to run its performance tests which are written using React-Native-Testing-Library
with addition of performance specific functions. With that in mind, the syntax should already be familiar to you,
let us consider the following example test:

```tsx
import { measureRender, writeTestStats, clearTestStats } from 'rn-perf-tool';

test('Home Screen', async () => {
  const stats = await measureRender(<HomeScreen />);
  await writeTestStats(stats, 'HomeScreen');
  expect(true).toBeTruthy();
});
```

First off, we make a Jest `test()` call, pass a name with which the test can be identified and pass
an `async` callback function, in which we `await` for the `measureRender()` function to run the performance test suite
and return results to `stats`. The next step is to write the stats as an entry under a recognizable name. For this, we
use `writeTestStats()` function, which takes the returned `stats` and a `name` argument and saves them for further
comparison.

Additionally, at the moment, we require an `expect(true).toBeTruthy();` statement call at the end of any test to
satiate Jest and avoid any issues arising from breaking away from its structure.

### Testing scenarios

Testing performance should be done by testing real world scenarios and user stories unique to every application.
React-native-testing-library allows us to handle that, by passing the `scenario` option to the
`measureRender()` function, e.g.

```tsx
test('Home Screen', async () => {
  const scenario = async (screen: RenderAPI) => {
    const plusOneButton = screen.getByText('Action');

    fireEvent.press(plusOneButton);
    await screen.findByText('Count: 1');

    fireEvent.press(plusOneButton);
    await screen.findByText('Count: 2');

    fireEvent.press(plusOneButton);
    fireEvent.press(plusOneButton);
    fireEvent.press(plusOneButton);
    await screen.findByText('Count: 5');
  };

  const stats = await measureRender(<HomeScreen />, { scenario });
  await writeTestStats(stats, 'HomeScreen');
  expect(true).toBeTruthy();
});
```

Scenario supplied to `measureRender()` options will run inside the performance test, while measuring render times
and render counts of supplied Component taking place in result of the interactions specified within. This allows
for simulating potential performance issues as they would occur for the end-user.

**Note that:**

1. Scenarios need to be `async` functions
2. Scenarios will receive `screen: RenderAPI` argument
3. Scenarios should utilise react-native-testing-library functions to simulated user behavior

### Testing tests in development environment

While developing your tests, you will likely want to test them before deployment and CI pipeline run with the
implemented tool. In order to do that you can run Jest using our node command present in rn-perf-tool's scripts

```shell
# provide an appropriate test_files_regex or use our default ".*\.perf\.(test|spec)\.(js|ts)x?$"
node --jitless --expose-gc --no-concurrent-sweeping --max-old-space-size=4096 node_modules/jest/bin/jest.js "$test_files_regex";
```

This will run your tests as matched by provided regexp and output the `current.txt` file containing results of your tests.
Please bear in mind however, that running repeated tests will result in adding more and more results to your `current.txt`
file. In order to avoid that we recommend running `await clearTestStats();` function before all your test suites are executed.
To achieve this we recommend using a `jest.config` file and passing this function [as a `globalSetup` option](https://jestjs.io/docs/configuration#globalsetup-string).

Alternatively, you could add the following snippet to the first test which is run in your suite.

```ts
beforeAll(async () => {
  await clearTestStats();
});
```

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
  count: 10,
  dropFirst: 1,
  outputFile: 'current.txt',
};
```

**`count`**: number of repeated runs in a series per test (allows for higher accuracy by aggregating more data). Should be handled with care.

**`dropFirst`**: number of first dropped results from the series per test (used to remove first test run outliers)

**`outputFile`**: name of the file the records will be saved to

### measureRender

Custom wrapper for the RNTL `render` function responsible for rendering the passed screen inside a `React.Profiler` component,
and measuring its performance. However, adding an optional `options` object allows for a more advanced manipulation of the process.

```ts
measureRender(ui: React.ReactElement & { type: { name?: string } }, options?: 1): Promise<MeasureRenderResult>;
```

**MeasureRenderOptions type**

```ts
interface MeasureRenderOptions {
  name?: string;
  scale?: number;
  count?: number;
  dropFirst?: number;
  wrapper?: (node: React.ReactElement) => JSX.Element;
  scenario?: (view: RenderAPI) => Promise<any>;
}
```

- **`name`**: name string used in logs
- **`scale`**: test run scale allowing to trigger a higher number of renders and scenario runs within singular test (may be used to tweak stability of the test, but should be avoided as it results to significantly higher resource consumption)
- **`count`**: number of runs per series for the particular test (as opposed to a global setting in `defaultConfig`)
- **`dropFirst`**: number of first runs dropped from a test series (as opposed to a global setting in `defaultConfig`)
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
npx rn-perf-tests
```

It will start the full process of running tests, saving intermediary files, swapping branches and generating outputs
to be later digested by Danger using the default settings.

### Main script arguments

- **`--base_branch`** name of the branch to compare against (DEFAULT: `"main"`)
- **`--base_file`** name of the baseline output file generated from the `base_branch` (DEFAULT: `"baseline"`)
- **`--current_file`** name of the current output file generated from the `current_branch` (DEFAULT: `"current"`)

Below, exemplary usage of these arguments:

```shell
npx rn-perf-tests --base_branch v1.0.0 --base_file v1_0_0_baseline --current_file v1_1_0_current
```

The script above will test branch `v1.1.0` performance results against current PR branch performance results and output
both results respectively to files `v1_0_0_baseline.txt` and `v1_1_0_current.txt`.

## Compare script

Node script responsible to comparing two output files from two separate runs of Jest test suites intended to be run on
your PR branch and compare against your main branch.

### Compare script arguments

By default, the compare script is run when `npx rn-perf-tests` is executed, as a part of the whole process and changing
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

- **`baselineFilePath`** path to the baseline output file from the target branch (DEFAULT: `baseline.txt`)
- **`currentFilePath`** path to the current output file from the PR branch (DEFAULT: `current.txt`)
- **`output`** type of the desired output. Can be set to `'console' | 'json' | 'all'` or left unspecified (DEFAULT: `undefined`)
- **`outputFilePath`** used in case of a `'json'` type output as the destination file path for output file (DEFAULT: `compare-output.json`)

### Running locally

To run the compare script locally, follow this steps:

1. Manually checkout to your main branch
2. Run the test suite to generate baseline output file
3. Save your baseline output file under a different name (you then will pass it to the script)
4. Checkout back to your PR branch
5. Run the test suite again generating your current output file
6. Run the following command, providing values for listed arguments

```shell
node "node_modules/rn-perf-tool/lib/commonjs/compare/compare.js" --baselineFilePath="" --currentFilePath=""
```

This will print output to your terminal as well as create an `compare-output.json` file in location from which the script had been triggered

## Danger.js plugin

By default, rn-perf-tool supports outputting the results of its analyses in PR/MR comment by using [Danger.js](https://danger.systems/js/).

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
