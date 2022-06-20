#!/usr/bin/env bash

RESULTS_DIR=".reassure"
RESULTS_FILE=".reassure/current.perf"

mkdir $RESULTS_DIR
rm -f $RESULTS_FILE

node \
  --jitless \
  --expose-gc \
  --no-concurrent-sweeping \
  --max-old-space-size=4096 \
  --no-expose_wasm \
  node_modules/jest/bin/jest.js \
   --runInBand \
   --testMatch "<rootDir>/**/*.perf-test.[jt]s?(x)"
