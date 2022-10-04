#!/usr/bin/env bash

# Exit on first error
set -e

# Branches are not fetched by default on CI
git fetch origin

BASELINE_BRANCH=${BASELINE_BRANCH:="main"}

# Gather baseline perf measurements
echo Git: switching to baseline branch "$BASELINE_BRANCH"
git switch "$BASELINE_BRANCH"

# Next line is required because Reassure packages are imported from this monorepo and might require rebuilding.
echo Rebuilding Reassure packages
pushd ../.. && yarn install --force && yarn turbo run build && popd

yarn install --force
yarn reassure --baseline --branch $(git branch --show-current) --commitHash $(git rev-parse HEAD)

# Gather current perf measurements & compare results
echo Git: switching back to current branch
git switch --detach -

# Next line is required because Reassure packages are imported from this monorepo and might require rebuilding.
echo Rebuilding Reassure packages
pushd ../.. && yarn install --force && yarn turbo run build && popd

echo GIT BRANCH: $(git branch --show-current) END
echo GIT COMMIT HASH: $(git rev-parse HEAD) END

yarn install --force
yarn reassure --branch $(git branch --show-current) --commitHash $(git rev-parse HEAD)
