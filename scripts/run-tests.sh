#!/usr/bin/env bash

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -b|--baseline_branch|--baseline-branch) BASELINE_BRANCH="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

BASELINE_BRANCH=${BASELINE_BRANCH:="main"}
CURRENT_BRANCH=$(git rev-parse --short HEAD)

BASELINE_FILE="baseline-results.txt"
CURRENT_FILE="perf-results.txt"

if [[ -z "$(readlink $0)" ]]; then
 # ../node_modules/rn-perf-tool/scripts/run-test.sh -> ../node_modules/rn-perf-tool
    ROOT_DIR="$(dirname $(dirname $0))"
else
    # resolving symlink when script is executed by npx or yarn
    ROOT_DIR="node_modules/rn-perf-tool";
fi

# Gather baseline perf test results
git checkout "$BASELINE_BRANCH";
sh "$ROOT_DIR/scripts/perf-test.sh"
mv perf-results.txt "$BASELINE_FILE";
git stash

# Gather current perf test results
git checkout "$CURRENT_BRANCH";
git stash pop
sh "$ROOT_DIR/scripts/perf-test.sh"

# Compare results
sh "$ROOT_DIR/scripts/perf-compare.sh"
