#!/usr/bin/env bash

CURRENT_BRANCH=$(git rev-parse --short HEAD)
BASELINE_BRANCH=${BASELINE_BRANCH:="main"}
TEST_RUNNER_PATH='node_modules/react-scripts/bin/react-scripts.js test'

# Gather baseline perf measurements
git checkout "$BASELINE_BRANCH";
CI=true TEST_RUNNER_PATH=$TEST_RUNNER_PATH npx reassure measure --baseline

# Gather current perf measurements
git checkout "$CURRENT_BRANCH";
CI=true TEST_RUNNER_PATH=$TEST_RUNNER_PATH npx reassure measure

# Compare results
CI=true TEST_RUNNER_PATH=$TEST_RUNNER_PATH npx reassure compare
