#!/usr/bin/env bash

BASELINE_BRANCH=${BASELINE_BRANCH:="main"}

# Gather baseline perf measurements
git switch "$BASELINE_BRANCH"

# Next line is required because Reassure packages are imported from this monorepo and might require rebuilding.
pushd ../.. && yarn install --force && yarn turbo run build && popd

yarn install --force
yarn reassure --baseline

# Gather current perf measurements & compare results
git switch -

# Next line is required because Reassure packages are imported from this monorepo and might require rebuilding.
pushd ../.. && yarn install --force && yarn turbo run build && popd

yarn install --force
yarn reassure
