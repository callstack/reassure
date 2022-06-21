#!/usr/bin/env bash

RESULT_FILE="perf-results.txt"
TEST_COMMAND=${TEST_COMMAND:="node_modules/.bin/jest"}

rm -f $RESULT_FILE

node \
  --jitless \
  --expose-gc \
  --no-concurrent-sweeping \
  --max-old-space-size=4096 \
  --no-expose_wasm \
  $TEST_COMMAND \
   --runInBand \
   --testMatch "<rootDir>/**/*.perf-test.[jt]s?(x)"
