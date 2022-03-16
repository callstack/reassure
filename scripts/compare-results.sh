#!/usr/bin/env bash

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -b|--base_file) BASELINE_FILE="$2"; shift ;;
        -c|--current_file) CURRENT_FILE="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

BASELINE_FILE=${BASELINE_FILE:="baseline-results.txt"}
CURRENT_FILE=${CURRENT_FILE:="perf-results.txt"}

if [[ -z "$(readlink $0)" ]]; then
    # ../node_modules/rn-perf-tool/scripts/run-test.sh -> ../node_modules/rn-perf-tool
    root_dir="$(dirname $(dirname $0))"
else
    # resolving symlink when script is executed by npx or yarn
    root_dir="node_modules/rn-perf-tool";
fi

node \
    --unhandled-rejections=throw \
    "$root_dir/lib/commonjs/analyser.js" \
    --output=all \
    --baselineFilePath="$BASELINE_FILE" \
    --currentFilePath="$CURRENT_FILE" \
&& node \
    --unhandled-rejections=throw \
    "$root_dir/lib/commonjs/markdown-builder.js" \
