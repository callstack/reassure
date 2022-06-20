#!/usr/bin/env bash

RESULTS_FILE="perf-results.txt"
BASELINE_FILE="baseline-results.txt"

# Gather baseline perf test results
npx reassure-perf
mv "$RESULTS_FILE" "$BASELINE_FILE";

# Gather current perf test results
npx reassure-perf

# Compare results
npx reassure-compare
