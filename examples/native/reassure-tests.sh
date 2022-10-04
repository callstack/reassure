#!/usr/bin/env bash

# Exit on first error
set -e

# Branches are not fetched by default on CI
git fetch

BASELINE_BRANCH=${BASELINE_BRANCH:="main"}

# Gather baseline perf measurements
git switch "$BASELINE_BRANCH"

# Next line is required because Reassure packages are imported from this monorepo and might require rebuilding.
pushd ../.. && yarn install --force && yarn turbo run build && popd

yarn install --force
yarn reassure --baseline --branch $(git branch --show-current) --commitHash $(git rev-parse HEAD)

# Gather current perf measurements & compare results
git switch -

# Next line is required because Reassure packages are imported from this monorepo and might require rebuilding.
pushd ../.. && yarn install --force && yarn turbo run build && popd

yarn install --force
yarn reassure --branch $(git branch --show-current) --commitHash $(git rev-parse HEAD)
