#!/usr/bin/env bash

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -c|--current_file) current_file="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done


current_file=${current_file:="current"}
test_files_regex=".*\.perf\.(test|spec)\.(js|ts)x?$"


if [[ -z "$(readlink $0)" ]]; then
 # ../node_modules/rn-perf-tool/scripts/run-test.sh -> ../node_modules/rn-perf-tool
    root_dir="$(dirname $(dirname $0))"
else
    # resolving symlink when script is executed by npx or yarn
    root_dir="node_modules/rn-perf-tool";
fi

node --jitless --expose-gc --no-concurrent-sweeping --max-old-space-size=4096 node_modules/jest/bin/jest.js "$test_files_regex";
mv "$current_file.txt" "$current_file"_temp.txt;
node --jitless --expose-gc --no-concurrent-sweeping --max-old-space-size=4096 node_modules/jest/bin/jest.js "$test_files_regex";
node --unhandled-rejections=throw "$root_dir/lib/commonjs/analyser.js" --output=all --baselineFilePath="$current_file"_temp.txt --currentFilePath="$current_file.txt" && node --unhandled-rejections=throw "$root_dir/lib/commonjs/markdown-builder.js"

