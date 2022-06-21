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

BASELINE_FILE=${BASELINE_FILE:=".reassure/baseline.perf"}
CURRENT_FILE=${CURRENT_FILE:=".reassure/current.perf"}
OUTPUT_TYPE=${OUTPUT_TYPE:="all"}

npx reassure-compare-internal \
    --output="$OUTPUT_TYPE" \
    --baselineFilePath="$BASELINE_FILE" \
    --currentFilePath="$CURRENT_FILE"
