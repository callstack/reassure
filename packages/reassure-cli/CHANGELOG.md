# @callstack/reassure-cli

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
