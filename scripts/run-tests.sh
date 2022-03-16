#!/usr/bin/env bash

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -base|--base_branch) base_branch="$2"; shift ;;
        -b|--base_file) base_file="$2"; shift ;;
        -c|--current_file) current_file="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

base_branch=${base_branch:="main"}
base_file=${base_file:="baseline-test-results.txt"}
current_file=${current_file:="current-test-results.txt"}
current_branch=$(git rev-parse --short HEAD)

if [[ -z "$(readlink $0)" ]]; then
 # ../node_modules/rn-perf-tool/scripts/run-test.sh -> ../node_modules/rn-perf-tool
    root_dir="$(dirname $(dirname $0))"
else
    # resolving symlink when script is executed by npx or yarn
    root_dir="node_modules/rn-perf-tool";
fi

# Gather baseline perf test results
#git checkout "$base_branch";
npx perf-test
mv perf-test-results.txt "$base_file";
git stash

# Gather current perf test results
git checkout "$current_branch";
git stash pop
yarn perf-test
#git checkout "$current_branch";
npx perf-test
mv perf-test-results.txt "$current_file";

# Compare
node --unhandled-rejections=throw "$root_dir/lib/commonjs/analyser.js" --output=all --baselineFilePath="$base_file" --currentFilePath="$current_file" && node --unhandled-rejections=throw "$root_dir/lib/commonjs/markdown-builder.js"
