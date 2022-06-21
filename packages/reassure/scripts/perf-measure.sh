#!/usr/bin/env bash

RESULTS_DIR=".reassure"
RESULTS_FILE=".reassure/current.perf"
TEST_COMMAND=${TEST_COMMAND:="node_modules/.bin/jest"}

mkdir -p $RESULTS_DIR
rm -f $RESULTS_FILE

node \
  --jitless \
  --expose-gc \
  --no-concurrent-sweeping \
  --max-old-space-size=4096 \
  --no-expose_wasm \
  $TEST_COMMAND \
   --runInBand \
   --testMatch "<rootDir>/**/*.perf-test.[jt]s?(x)"
