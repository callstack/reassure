---
title: Migration to v1.x
sidebar_position: 6
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Migration to v1.x

## Installation

Reassure v1 RC is available using `next` npm tag:

<Tabs>
<TabItem value="npm" label="npm">
```sh
npm install --save-dev reassure@next
```
</TabItem>
<TabItem value="yarn" label="yarn">
```sh
yarn add --dev reassure@next
```
</TabItem>
</Tabs>

## Breaking changes

### Rename `measurePerformance` to `measureRenders`

The signature of the function did not change. Old name is still available but will generate warning messages when used.

### Rename `resetToDefault` to `resetToDefaults`

The signature of the function did not change. Old name is no longer available.

## Testing environment

Reassure V0 used Node.js JIT-less mode (`--jitless` node flag), optionally using different flags if `--enable-wasp` experimental option was passed. Reassure V1 runs tests using Node.js's non-optimized compilation to better reflect React Native runtime environment.

This means that:

1. Tests will run ~2x faster than in V0. This should be visible in the single PR where you update Reassure to V1 in your repo as the baseline measurements will run with the old flags, while the current measurements will run with the new flags. Afterwards, both baseline and current measurement should run with the same compilation options.
2. WebAssembly is now enabled by default.

## Non-breaking changes

### Removal of `--enable-wasm` flag

Reassure now runs tests with WebAssembly enable by default (see [testing environment](#testing-environment)).
