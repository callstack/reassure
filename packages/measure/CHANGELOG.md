# @callstack/reassure-measure

## 1.4.0

### Minor Changes

- c51fb5f: feat: add measureAsyncFunction
- 59b21d4: feat: add `removeOutliers` option to detect and drop statistical outliers
- db535ea: feat: add support for setup/cleanup functions during each test run

### Patch Changes

- 0870117: chore: upgrade deps
- b34459f: enable outlier detection by default
- Updated dependencies [0870117]
  - @callstack/reassure-logger@1.4.0

## 1.4.0-next.0

### Minor Changes

- c51fb5f: feat: add measureAsyncFunction
- 59b21d4: Added a `removeOutliers` option to detect and drop statistical outliers

### Patch Changes

- 0870117: chore: upgrade deps
- Updated dependencies [0870117]
  - @callstack/reassure-logger@1.4.0-next.0

## 1.3.3

### Patch Changes

- @callstack/reassure-logger@1.3.3

## 1.3.2

### Patch Changes

- @callstack/reassure-logger@1.3.2

## 1.3.1

### Patch Changes

- @callstack/reassure-logger@1.3.1

## 1.3.0

### Minor Changes

- 63f1f35: improve `measureRenders` precision on React Native

### Patch Changes

- @callstack/reassure-logger@1.3.0

## 1.2.1

### Patch Changes

- 75dc782: chore: update deps
  - @callstack/reassure-logger@1.2.1

## 1.2.0

### Patch Changes

- Updated dependencies [ce30981]
  - @callstack/reassure-logger@1.2.0

## 1.1.0

### Patch Changes

- 068951b: fix: respect to the "testingLibrary" config option
- 0adb9cc: chore: update deps
- Updated dependencies [0adb9cc]
  - @callstack/reassure-logger@1.1.0

## 1.0.0

### Major Changes

- Rename `measurePerformance` to `measureRenders`.

### Minor Changes

- ebcf9d6: Detect render issues (initial render updates, redundant renders)
- ebcf9d6: chore: migrate to Yarn Berry (4.x)
- ebcf9d6: chore: fix version deps

## 0.11.0

### Minor Changes

- b455bd4: - Add `writeFile` option to `measurePerformance`/`measureFunction`.

### Patch Changes

- b455bd4: refactor: simplify `reassure-logger` package exports
- Updated dependencies [b455bd4]
  - @callstack/reassure-logger@0.11.0

## 0.6.0

### Minor Changes

- baf90de1: (BREAKING) feat: `wrapper` option for `measurePerformance`/`measureRender` function now accepts a React component instead of wrapper function.
- ea70aabb: (BREAKING) refactor: renamed `dropWorst` option to `warmupRuns` with slight change of logic behind it.
- feat: `measureFunction` API to measure regular JS functions execution time

### Patch Changes

- Updated dependencies [99afdf98]
  - @callstack/reassure-logger@0.3.2

## 0.5.1

### Patch Changes

- Updated dependencies [2e127815]
  - @callstack/reassure-logger@0.3.1

## 0.5.0

### Minor Changes

- f8aa25fe: feat: capture date and time of measurements

### Patch Changes

- fa59394e: fix: exclude wrapper component from render measurements

## 0.4.1

### Patch Changes

- Updated dependencies [235f37d4]
  - @callstack/reassure-logger@0.3.0

## 0.4.0

### Minor Changes

- 35af62a4: Custom logger implementation with verbose and silent modes.

### Patch Changes

- Updated dependencies [35af62a4]
  - @callstack/reassure-logger@0.2.0

## 0.3.1

### Patch Changes

- 5a1c3472: Changes for dependencies cleanup after monorepo migration

## 0.3.0

### Minor Changes

- 7ad802b9: `testingLibrary` configuration option that replaces `render` and `cleanup` options

## 0.2.0

### Minor Changes

- Support React Testing Library (web) autodiscovery.

## 0.1.2

### Patch Changes

- 417dcf6a: Ability to provide custom `render` and `cleanup` function for measure step.

## 0.1.1

### Patch Changes

- ca56a6d1: Move internal packages under @reassure scope to @callstack scope for simpler maintenance

## 0.1.0

### Minor Changes

- d6bfef03: Add note about ignoring .reassure folder

## 0.0.3

### Patch Changes

- 27f45e83: Fix typescript setup for publishing with bob

## 0.0.2

### Patch Changes

- 2f8f8c06: setup changesets
