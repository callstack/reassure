#!/usr/bin/env bash
set -e 

BASELINE_BRANCH=${BASELINE_BRANCH:="main"}

# Required for `git switch` on CI
git fetch origin

# Gather baseline perf measurements
git switch "$BASELINE_BRANCH"

# Next line is required because Reassure packages are imported from this monorepo and might require rebuilding.
pushd ../.. && yarn install --force && yarn turbo run build && popd

yarn install --force
yarn reassure --baseline

# Gather current perf measurements & compare results
git switch --detach -

# Next line is required because Reassure packages are imported from this monorepo and might require rebuilding.
pushd ../.. && yarn install --force && yarn turbo run build && popd

yarn install --force
yarn reassure --branch
