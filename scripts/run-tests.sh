#!/usr/bin/env bash

while [[ "$#" > 0 ]]; do
    case $1 in
        -base|--base_branch) base_branch="$2"; shift ;;
        -b|--base_file) base_file="$2"; shift ;;
        -c|--current_file) current_file="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done


base_branch=${base_branch:="main"}
base_file=${base_file:="baseline"}
current_file=${current_file:="current"}
current_branch=$(git branch --show-current)

rootDir="$(dirname $(dirname $0))"
node --jitless --expose-gc --no-concurrent-sweeping --max-old-space-size=4096 node_modules/jest/bin/jest.js;
mv "$current_file.txt" "$current_file"_temp.txt;
git checkout "$base_branch";
node --jitless --expose-gc --no-concurrent-sweeping --max-old-space-size=4096 node_modules/jest/bin/jest.js;
mv "$current_file".txt "$base_file".txt;
git checkout "$current_branch";
mv "$current_file"_temp.txt "$current_file.txt";
node "$rootDir/lib/commonjs/analyser.js" --output=all --baselineFilePath="$base_file.txt" --currentFilePath="$current_file.txt"


