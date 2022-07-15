#!/usr/bin/env bash
BASELINE_BRANCH=${BASELINE_BRANCH:="main"}

# Gather baseline perf measurements
git switch "$BASELINE_BRANCH"
yarn reassure --baseline

# Gather current perf measurements & compare results
git switch -
yarn reassure
