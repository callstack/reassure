#!/usr/bin/env bash

BASELINE_FILE="baseline-results.txt"

if [[ -z "$(readlink $0)" ]]; then
 # ../node_modules/rn-perf-tool/scripts/run-test.sh -> ../node_modules/rn-perf-tool
    ROOT_DIR="$(dirname $(dirname $0))"
else
    # resolving symlink when script is executed by npx or yarn
    ROOT_DIR="node_modules/rn-perf-tool";
fi

# Gather baseline perf test results
"$ROOT_DIR/scripts/perf-test.sh"
mv perf-results.txt "$BASELINE_FILE";

# Gather current perf test results
"$ROOT_DIR/scripts/perf-test.sh"

# Compare results
"$ROOT_DIR/scripts/perf-compare.sh"
