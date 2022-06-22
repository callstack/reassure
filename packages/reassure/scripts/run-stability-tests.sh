#!/usr/bin/env bash

# Gather baseline perf test results
npx reassure measure --baseline

# Gather current perf test results
npx reassure measure

# Compare results
npx reassure compare
