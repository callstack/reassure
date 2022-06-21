#!/usr/bin/env bash

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --baseline_branch|--baseline-branch) BASELINE_BRANCH="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

BASELINE_BRANCH=${BASELINE_BRANCH:="main"}
CURRENT_BRANCH=$(git rev-parse --short HEAD)

RESULTS_FILE=".reassure/current.perf"
BASELINE_FILE=".reassure/baseline.perf"

# Gather baseline perf test results
git checkout "$BASELINE_BRANCH";
npx reassure-measure
mv "$RESULTS_FILE" "$BASELINE_FILE";

# Gather current perf test results
git checkout "$CURRENT_BRANCH";
npx reassure-measure

# Compare results
npx reassure compare
