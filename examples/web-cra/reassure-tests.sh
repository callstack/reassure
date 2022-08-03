#!/usr/bin/env bash
BASELINE_BRANCH=${BASELINE_BRANCH:="main"}

# Gather baseline perf measurements
git switch "$BASELINE_BRANCH"
yarn
yarn perf-test --baseline

# Gather current perf measurements & compare results
git switch -
yarn
yarn perf-test
