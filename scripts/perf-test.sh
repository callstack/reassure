#!/usr/bin/env bash

RESULT_FILE="perf-results.txt"

rm -f $RESULT_FILE

node \
  --jitless \
  --expose-gc \
  --no-concurrent-sweeping \
  --max-old-space-size=4096 \
  --no-expose_wasm \
  node_modules/jest/bin/jest.js \
   --runInBand \
   --testMatch "<rootDir>/**/*.perf-test.[jt]s?(x)"
