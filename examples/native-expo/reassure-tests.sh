#!/usr/bin/env bash

CURRENT_BRANCH=$(git rev-parse --short HEAD)
BASELINE_BRANCH=${BASELINE_BRANCH:="main"}

# Gather baseline perf measurements
git checkout "$BASELINE_BRANCH"
yarn install
yarn reassure measure --baseline

# Gather current perf measurements & compare results
git checkout "$CURRENT_BRANCH"
yarn install
yarn reassure measure
