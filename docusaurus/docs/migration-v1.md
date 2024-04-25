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
