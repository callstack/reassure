---
sidebar_position: 2
---

# Installation and setup

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

- [React Native (CLI)](https://github.com/callstack/reassure/tree/main/examples/native)
- [React Native (Expo)](https://github.com/callstack/reassure/tree/main/examples/native-expo)

Reassure will try to detect which Testing Library you have installed. In case both React Native Testing Library and React Testing Library are present it will
warn you about that and give a precedence to React Native Testing Library. You can explicitly specify Testing Library to by used by using [`configure`](#configure-function) option:

```
configure({ testingLibrary: 'react-native' })
// or
configure({ testingLibrary: 'react' })
```

You should set it in your Jest setup file and you can override it in particular test files if needed.

## Writing your first test

Now that the library is installed, you can write you first test scenario in a file with `.perf-test.js`/`.perf-test.tsx` extension:

```ts
// ComponentUnderTest.perf-test.tsx
import { measurePerformance } from 'reassure';

test('Simple test', async () => {
  await measurePerformance(<ComponentUnderTest />);
});
```

This test will measure render times of `ComponentUnderTest` during mounting and resulting sync effects.

> **Note**: Reassure will automatically match test filenames using Jest's `--testMatch` option with value `"<rootDir>/**/*.perf-test.[jt]s?(x)"`. However, if you would like to pass a custom `--testMatch` option, you may add it to the `reassure measure` script in order to pass your own glob. More about `--testMatch` in [Jest docs](https://jestjs.io/docs/configuration#testmatch-arraystring)

### Writing async tests

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

For more examples look into our [test example app](https://github.com/callstack/reassure/tree/main/examples/native/src).

## Measuring test performance

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

## CI setup

To make setting up the CI integration and all prerequisites more convenient, we have prepared a CLI command which will generate all necessary templates for you to get started with.

Simply run:

```bash
yarn reassure init
```

This will generate the following file structure

```
├── <ROOT>
│   ├── .reassure/
│   ├──  reassure-tests.sh
│   ├── dangerfile.ts (conditional)
│   ├── dangerfile.reassure.ts (conditional)
│   └── .gitignore (conditional)
```

### Options

You can also use the following options in order to further adjust the script

#### `--verbose` (optional)

This is one of the options controlling the level of logs printed into the command prompt while running reassure scripts. It will

#### `--silent` (optional)

Just like the previous, this option also controls the level of logs. It will suppress all logs besides explicit errors.

#### `--no-ascii-art` (optional)

Just like the previous, this option also controls the level of logs. It will suppress ascii art based Hello and Bye messages.

#### `--javascript` (optional)

By default Reassure scripts will generate TypeScript files. You can use this option, if you'd like to generate JavaScript files instead.

### Scaffolding

#### `dangerfile.ts and dangerfile.reassure.ts`

If your project already contains a `dangerfile`, the CLI will not override it in any way. Instead, it will generate a `dangerfile.reassure.ts` file which will allow you to compare and update your own at your own convenience.

#### `.gitignore`

If .gitignore file is present and no mentions of `reassure` appear within it, the script will append the `.reassure/` directory to its end.

#### `reassure-tests.sh`

Basic script allowing you to run Reassure on CI. More on the importance and structure of this file in the following section.

### Performance test script

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

You will need a working [Danger JS setup](https://danger.systems/js/guides/getting_started.html).

Then add Reassure Danger JS plugin to your dangerfile :

```ts
import path from 'path';
import { dangerReassure } from 'reassure';

dangerReassure({
  inputFilePath: path.join(__dirname, '.reassure/output.md'),
});
```

You can also check our example [Dangerfile](https://github.com/callstack/reassure/blob/main/dangerfile.ts).

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

> **Note**: Your performance test will run much longer than regular integration tests. It's because we run each test scenario multiple times (by default 10), and we repeat that for two branches of your code. Hence, each test will run 20 times by default. That's unless you increase that number even higher.

## Optional: ESLint setup

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
