#!/usr/bin/env bash

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --baseline_file|--baseline-file) BASELINE_FILE="$2"; shift ;;
        --current_file|--current-file) CURRENT_FILE="$2"; shift ;;
        --output-type) OUTPUT_TYPE="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

BASELINE_FILE=${BASELINE_FILE:="baseline-results.txt"}
CURRENT_FILE=${CURRENT_FILE:="perf-results.txt"}
OUTPUT_TYPE=${OUTPUT_TYPE:="all"}

if [[ -z "$(readlink $0)" ]]; then
    # ../node_modules/rn-perf-tool/scripts/run-test.sh -> ../node_modules/rn-perf-tool
    ROOT_DIR="$(dirname $(dirname $0))"
else
    # resolving symlink when script is executed by npx or yarn
    ROOT_DIR="node_modules/rn-perf-tool";
fi

node \
    --unhandled-rejections=throw \
    "$ROOT_DIR/lib/commonjs/compare/compare.js" \
    --output="$OUTPUT_TYPE" \
    --baselineFilePath="$BASELINE_FILE" \
    --currentFilePath="$CURRENT_FILE"
