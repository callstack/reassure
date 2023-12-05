---
title: Troubleshooting
sidebar_position: 5
---

### Handling `ReferenceError: WebAssembly is not defined`

Reassure, by default, uses Node.js's `--jitless` flag to disable its optimizing compiler to increase test stability. This flag prevents WebAssembly (WASM) from running because of internal Node.js architecture. In some cases, you might still allow your tests to include code depending on WASM, e.g., the `fetch` method is implemented using WASM.

In such cases, pass the `--enable-wasm` flag to Reassure CLI:

```sh
$ reassure --enable-wasm
```

This option will replace the Node.js `--jitless` flag with alternative flags to achieve a similar stabilizing effect.

Note that this option is experimental and may negatively affect the stability of your tests.
