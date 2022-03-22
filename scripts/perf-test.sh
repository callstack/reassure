#!/usr/bin/env bash

RESULT_FILE="perf-results.txt"

rm -f $RESULT_FILE

node \
  --jitless \
  --expose-gc \
  --no-concurrent-sweeping \
  --max-old-space-size=4096 \
  node_modules/jest/bin/jest.js \
   --testMatch "<rootDir>/**/*.perf-test.[jt]s?(x)"
