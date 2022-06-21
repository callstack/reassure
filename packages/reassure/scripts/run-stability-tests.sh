#!/usr/bin/env bash

RESULTS_FILE=".reassure/current.perf"
BASELINE_FILE=".reassure/baseline.perf"

# Gather baseline perf test results
npx reassure-measure
mv "$RESULTS_FILE" "$BASELINE_FILE";

# Gather current perf test results
npx reassure-measure

# Compare results
npx reassure compare
