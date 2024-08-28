# @callstack/reassure-cli

## 1.2.0

### Minor Changes

- cd71fa7: Extent default testMatch: `**/__perf__/*.(js|ts)` and `*/*.perf.(js|ts)`
- ce30981: --textRegex CLI option
- 018cd40: Passthrough args after -- to Jest

### Patch Changes

- Updated dependencies [ce30981]
  - @callstack/reassure-logger@1.2.0
  - @callstack/reassure-compare@1.2.0

## 1.1.0

### Patch Changes

- 0adb9cc: chore: update deps
- Updated dependencies [0adb9cc]
- Updated dependencies [d1d3617]
  - @callstack/reassure-compare@1.1.0
  - @callstack/reassure-logger@1.1.0

## 1.0.0

### Minor Changes

- ebcf9d6: `reassure` enables WASM support by default and runs using v8 baseline compilers: sparkplug and liftoff (WASM)
- ebcf9d6: Detect render issues (initial render updates, redundant renders)
- ebcf9d6: chore: migrate to Yarn Berry (4.x)
- ebcf9d6: chore: fix version deps

## 0.11.0

### Patch Changes

- b455bd4: refactor: simplify `reassure-logger` package exports
- Updated dependencies [b455bd4]
- Updated dependencies [bb2046a]
  - @callstack/reassure-logger@0.11.0
  - @callstack/reassure-compare@0.11.0

## 0.10.2

### Patch Changes

- 8ca46a44: feat: Experimental options to enable WebAssembly (--enable-wasm)

## 0.10.0

### Minor Changes

- baf90de1: (BREAKING) feat: `wrapper` option for `measurePerformance`/`measureRender` function now accepts a React component instead of wrapper function.
- feat: `measureFunction` API to measure regular JS functions execution time

### Patch Changes

- Updated dependencies
- Updated dependencies [99afdf98]
  - @callstack/reassure-compare@0.6.0
  - @callstack/reassure-logger@0.3.2

## 0.9.1

### Patch Changes

- Updated dependencies [2e127815]
  - @callstack/reassure-logger@0.3.1
  - @callstack/reassure-compare@0.5.1

## 0.9.0

### Minor Changes

- f8aa25fe: feat: capture date and time of measurements

### Patch Changes

- fa59394e: fix: exclude wrapper component from render measurements
- c2dffec0: fix: support running perf tests when user has `jest-expo` installed
- Updated dependencies [f8aa25fe]
  - @callstack/reassure-compare@0.5.0

## 0.8.0

### Minor Changes

- 235f37d4: init CLI command

### Patch Changes

- Updated dependencies [235f37d4]
  - @callstack/reassure-logger@0.3.0
  - @callstack/reassure-compare@0.4.1

## 0.7.0

### Minor Changes

- 35af62a4: Custom logger implementation with verbose and silent modes.
- a046afde: Add support for passing a custom `--testMatch` option to Jest

### Patch Changes

- Updated dependencies [35af62a4]
  - @callstack/reassure-compare@0.4.0
  - @callstack/reassure-logger@0.2.0

## 0.6.1

### Patch Changes

- ff5e2ff: fix: handling of TEST_RUNNER_PATH env variable

## 0.6.0

### Minor Changes

- 7691e28: feat: windows support
- 3a180f2: Validate format of performance results files when loading for comparison

### Patch Changes

- 7cbd1d3: Fix random race condition for `reassure check-stability` command
- Updated dependencies [3a180f2]
  - @callstack/reassure-compare@0.3.0

## 0.5.0

### Minor Changes

- b4250e3c: Include codebase metadata (branch, commit hash) in the performance report and measurement file
- 067f66d3: Automatically get branch and commit hash CLI options from Git if not passed

### Patch Changes

- 5a1c3472: Changes for dependencies cleanup after monorepo migration
- Updated dependencies [b4250e3c]
- Updated dependencies [5a1c3472]
  - @callstack/reassure-compare@0.2.0

## 0.4.0

### Minor Changes

- d9b30f57: Fail reassure if jest exits with an error

## 0.3.0

### Minor Changes

- 4d0cca6a: Merge (remove) `ressure compare` with `reassure measure`. Performance comparison will be generated automatically when baseline file already exists when running `measure`. You can disable that output by specifying `--no-compare` option for `measure` command.

  Also set `reassure` default command as alias to `reassure measure`, so now you can run `reassure` instead of `reassure measure`.

### Patch Changes

- ca56a6d1: Move internal packages under @reassure scope to @callstack scope for simpler maintenance
- Updated dependencies [4d0cca6a]
- Updated dependencies [ca56a6d1]
  - @callstack/reassure-compare@0.1.1

## 0.2.0

### Minor Changes

- 472c7735: Add `TEST_RUNNER_PATH` and `TEST_RUNNER_ARGS` env variables to configure test runner

## 0.1.0

### Minor Changes

- d6bfef03: Add note about ignoring .reassure folder

### Patch Changes

- Updated dependencies [d6bfef03]
  - @callstack/reassure-compare@0.1.0

## 0.0.4

### Patch Changes

- 27f45e83: Fix typescript setup for publishing with bob
- Updated dependencies [27f45e83]
  - @callstack/reassure-compare@0.0.3

## 0.0.3

### Patch Changes

- 91959c68: Fix index export

## 0.0.2

### Patch Changes

- 2f8f8c06: setup changesets
- Updated dependencies [2f8f8c06]
  - @callstack/reassure-compare@0.0.2
