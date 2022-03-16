#!/usr/bin/env bash

RESULT_FILE="perf-test-results.txt"
FILE_REGEX=".*.perf-test.(js|jsx|ts|tsx)$"

rm -f $RESULT_FILE

node \
  --jitless \
  --expose-gc \
  --no-concurrent-sweeping \
  --max-old-space-size=4096 \
  node_modules/jest/bin/jest.js $FILE_REGEX
