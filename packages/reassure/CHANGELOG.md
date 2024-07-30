# reassure

## 1.1.0

### Minor Changes

- d1d3617: Expose "Warmup Runs" and "Render Issues" in markdown report

### Patch Changes

- 0adb9cc: chore: update deps
- Updated dependencies [068951b]
- Updated dependencies [0adb9cc]
- Updated dependencies [d1d3617]
  - @callstack/reassure-measure@1.1.0
  - @callstack/reassure-compare@1.1.0
  - @callstack/reassure-danger@1.1.0
  - @callstack/reassure-cli@1.1.0

## 1.0.0

### Major Changes

- 4352279: - Rename `measurePerformance` to `measureRenders`, `resetToDefault` to `resetToDefaults`.

### Minor Changes

- ea761f8: `reassure` enables WASM support by default and runs using v8 baseline compilers: sparkplug and liftoff (WASM)
- 04be1d4: Detect render issues (initial render updates, redundant renders)
- ebcf9d6: chore: migrate to Yarn Berry (4.x)
- ebcf9d6: chore: fix version deps

## 0.11.0

### Minor Changes

- b455bd4: - Add `writeFile` option to `measurePerformance`/`measureFunction`.

### Patch Changes

- Updated dependencies [b455bd4]
- Updated dependencies [b455bd4]
  - @callstack/reassure-measure@0.11.0
  - @callstack/reassure-cli@0.11.0
  - @callstack/reassure-danger@0.11.0

## 0.10.2

### Patch Changes

- 8ca46a44: feat: Experimental options to enable WebAssembly (--enable-wasm)

## 0.10.1

### Patch Changes

- d74f81e: hotfix: make measureFunction a publicly available API

## 0.10.0

### Minor Changes

- baf90de1: (BREAKING) feat: `wrapper` option for `measurePerformance`/`measureRender` function now accepts a React component instead of wrapper function.
- ea70aabb: (BREAKING) refactor: renamed `dropWorst` option to `warmupRuns` with slight change of logic behind it.
- feat: `measureFunction` API to measure regular JS functions execution time

### Patch Changes

- Updated dependencies
- Updated dependencies [baf90de1]
- Updated dependencies [ea70aabb]
  - @callstack/reassure-cli@0.10.0
  - @callstack/reassure-measure@0.6.0

## 0.9.1

### Patch Changes

- @callstack/reassure-cli@0.9.1
- @callstack/reassure-measure@0.5.1

## 0.9.0

### Minor Changes

- f8aa25fe: feat: capture date and time of measurements

### Patch Changes

- fa59394e: fix: exclude wrapper component from render measurements
- Updated dependencies [fa59394e]
- Updated dependencies [f8aa25fe]
- Updated dependencies [c2dffec0]
  - @callstack/reassure-measure@0.5.0
  - @callstack/reassure-cli@0.9.0

## 0.8.0

### Minor Changes

- 235f37d4: init CLI command

### Patch Changes

- Updated dependencies [235f37d4]
  - @callstack/reassure-cli@0.8.0
  - @callstack/reassure-measure@0.4.1

## 0.7.2

### Patch Changes

- Updated dependencies [35af62a4]
- Updated dependencies [a046afde]
  - @callstack/reassure-measure@0.4.0
  - @callstack/reassure-cli@0.7.0

## 0.7.1

### Patch Changes

- ff5e2ff: fix: handling of TEST_RUNNER_PATH env variable

## 0.7.0

### Minor Changes

- 7691e28: feat: windows support
- 3a180f2: Validate format of performance results files when loading for comparison

### Patch Changes

- Updated dependencies [3a180f2]
- Updated dependencies [7691e28]
- Updated dependencies [7cbd1d3]
  - @callstack/reassure-cli@0.6.0

## 0.6.0

### Minor Changes

- b4250e3c: Include codebase metadata (branch, commit hash) in the performance report and measurement file
- 067f66d3: Automatically get branch and commit hash CLI options from Git if not passed

### Patch Changes

- 5a1c3472: Changes for dependencies cleanup after monorepo migration
- Updated dependencies [b4250e3c]
- Updated dependencies [5a1c3472]
- Updated dependencies [067f66d3]
  - @callstack/reassure-cli@0.5.0
  - @callstack/reassure-danger@0.1.1
  - @callstack/reassure-measure@0.3.1

## 0.5.0

### Minor Changes

- 76d60476: Extract reassure-danger to a seperate package

### Patch Changes

- Updated dependencies [76d60476]
- Updated dependencies [d9b30f57]
  - @callstack/reassure-danger@0.1.0
  - @callstack/reassure-cli@0.4.0

## 0.4.0

### Minor Changes

- 7ad802b9: `testingLibrary` configuration option that replaces `render` and `cleanup` options

### Patch Changes

- Updated dependencies [7ad802b9]
  - @callstack/reassure-measure@0.3.0

## 0.3.0

### Minor Changes

- Support React Testing Library (web) autodiscovery.

### Patch Changes

- Updated dependencies
  - @callstack/reassure-measure@0.2.0

## 0.2.1

### Patch Changes

- 417dcf6a: Ability to provide custom `render` and `cleanup` function for measure step.
- Updated dependencies [417dcf6a]
  - @callstack/reassure-measure@0.1.2

## 0.2.0

### Minor Changes

- 4d0cca6a: Merge (remove) `ressure compare` with `reassure measure`. Performance comparison will be generated automatically when baseline file already exists when running `measure`. You can disable that output by specifying `--no-compare` option for `measure` command.

  Also set `reassure` default command as alias to `reassure measure`, so now you can run `reassure` instead of `reassure measure`.

### Patch Changes

- ca56a6d1: Move internal packages under @reassure scope to @callstack scope for simpler maintenance
- Updated dependencies [4d0cca6a]
- Updated dependencies [ca56a6d1]
  - @callstack/reassure-cli@0.3.0
  - @callstack/reassure-measure@0.1.1

## 0.1.2

### Patch Changes

- 35f66ad6: Fixed image links for npmjs.com

## 0.1.1

### Patch Changes

- Updated dependencies [472c7735]
  - @callstack/reassure-cli@0.2.0

## 0.1.0

### Minor Changes

- d6bfef03: Add note about ignoring .reassure folder

### Patch Changes

- Updated dependencies [d6bfef03]
  - @callstack/reassure-cli@0.1.0
  - @callstack/reassure-measure@0.1.0

## 0.0.6

### Patch Changes

- 27f45e83: Fix typescript setup for publishing with bob
- Updated dependencies [27f45e83]
  - @callstack/reassure-cli@0.0.4
  - @callstack/reassure-measure@0.0.3

## 0.0.5

### Patch Changes

- 91959c68: Fix index export
- Updated dependencies [91959c68]
  - @callstack/reassure-cli@0.0.3

## 0.0.4

### Patch Changes

- Fix images

## 0.0.3

### Patch Changes

- c714f1b6: Add readme for the reassure package so it's visible in npm

## 0.0.2

### Patch Changes

- 2f8f8c06: setup changesets
- Updated dependencies [2f8f8c06]
  - @callstack/reassure-cli@0.0.2
  - @callstack/reassure-measure@0.0.2
