# rn-perf-tool

- [Installation and setup](#Installation-and-setup)
  * [Installing NPM package](#Installing-NPM-package)
  * [Adding CI step](#Adding-CI-step)
    + [Comparing against custom branch](#Comparing-against-custom-branch)
  * [Configuring dangerfile](#Configuring-dangerfile)
- [Writing performance tests](#writing-performance-tests)
- [API Reference](#API-reference)
  * [Measuring Script](#Measuring-Script)
  * [Analysing Script](#Analysing-Script)
  * [Shell Script](#Shell-Script)
  * [DangerJs Plugin](#DangerJs-Plugin)
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
  run: npx rn-perf-tool
```

Together with dangerJs setup, in case of GitHub Actions, it could look something like this:

```yaml
- name: Run comparative test script
  run: npx rn-perf-tool

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
  run: npx rn-perf-tool --base_branch lts
```

With this, each current test run will be compared against test runs made in branch `lts`.

### Configuring dangerfile
Danger only requires importing the danger plugin and executing it inside your dangerfile, like such:

```ts
import { plugin as perfPlugins } from './plugins';

perfPlugins.dangerJs();
```

This basic setup will allow you to run the toolset based on your pipeline setup, ideally every time a PR is created for
your repository.

## Writing performance tests

## API Reference
### Measuring Script
### Analysing Script
### Shell Script
### DangerJs Plugin

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
