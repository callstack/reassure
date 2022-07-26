# reassure

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
