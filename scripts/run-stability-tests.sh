#!/usr/bin/env bash

RESULTS_FILE="perf-results.txt"
BASELINE_FILE="baseline-results.txt"

if [[ -z "$(readlink $0)" ]]; then
 # ../node_modules/reassure/scripts/run-test.sh -> ../node_modules/reassure
    ROOT_DIR="$(dirname $(dirname $0))"
else
    # resolving symlink when script is executed by npx or yarn
    ROOT_DIR="node_modules/reassure";
fi

# Gather baseline perf test results
"$ROOT_DIR/scripts/perf-test.sh"
mv "$RESULTS_FILE" "$BASELINE_FILE";

# Gather current perf test results
"$ROOT_DIR/scripts/perf-test.sh"

# Compare results
"$ROOT_DIR/scripts/perf-compare.sh"
