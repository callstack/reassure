#!/usr/bin/env bash
set -e 

BASELINE_BRANCH=${GITHUB_BASE_REF:="main"}

# Required for `git switch` on CI
git fetch origin

# Gather baseline perf measurements
git switch "$BASELINE_BRANCH"

# Next line is required because Reassure packages are imported from this monorepo and might require rebuilding.
pushd ../.. && yarn install && yarn turbo run build && popd

yarn install
yarn reassure --baseline

# Gather current perf measurements & compare results
git stash # Get rid of any local changes
git switch --detach -

# Next line is required because Reassure packages are imported from this monorepo and might require rebuilding.
pushd ../.. && yarn install && yarn turbo run build && popd

yarn install
yarn reassure
