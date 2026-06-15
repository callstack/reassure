#!/usr/bin/env bash
# =============================================================================
# stability-harness.sh — Node.js flag stability assessment tool
# =============================================================================
#
# PURPOSE
#   Measures how stable (reproducible) performance measurements are under a
#   given set of Node.js flags. Runs the perf test suite twice with identical
#   flags and reports the coefficient of variation (CV = stdev/mean) for each
#   measured scenario. Lower CV means more stable measurements.
#
# USAGE
#   Run from test-apps/native or the repo root:
#
#     ./stability-harness.sh [node flags...]
#
#   Examples:
#     ./stability-harness.sh                                        # current defaults only
#     ./stability-harness.sh --expose-gc --max-opt=1               # specific flag set
#     ./stability-harness.sh --expose-gc --max-opt=1 --some-flag   # testing a candidate
#
# HOW TO ASSESS A CANDIDATE FLAG
#   The harness runs BOTH passes with the SAME flags — it is a stability probe,
#   not an A/B test. To assess whether a flag helps:
#
#   1. Run the harness several times WITHOUT the flag (base configuration):
#        ./stability-harness.sh --expose-gc --no-concurrent-sweeping --max-opt=1 --max-old-space-size=4096
#      Record the "Weighted Average" values from both runs across all invocations.
#
#   2. Run the harness the same number of times WITH the candidate flag added:
#        ./stability-harness.sh --expose-gc --no-concurrent-sweeping --max-opt=1 --max-old-space-size=4096 --some-flag
#      Record the "Weighted Average" values.
#
#   3. Compare the two sets. A flag is worth adopting if it consistently lowers
#      the average CV across multiple invocations. Single-run comparisons are
#      unreliable — run at least 3 invocations per configuration.
#
#   4. NEVER run two harness invocations in parallel. Parallel runs share CPU
#      resources and contaminate each other's measurements.
#
# OUTPUT INTERPRETATION
#   "Stability / Weighted Average: X% => Y%"
#     X% = mean-duration-weighted average CV of Run 1 (cold)
#     Y% = mean-duration-weighted average CV of Run 2 (warm)
#
#   Both X and Y describe the SAME flag configuration. Run 2 is typically
#   more stable because the JIT and allocator are warmer. Focus on Y% when
#   comparing configurations; use X% to spot cold-start regressions.
#
#   Typical values with the current default flags (Node 22):
#     Good:    < 1.0%
#     Okay:    1.0% – 1.5%
#     Noisy:   > 1.5%
#
# FLAGS ALREADY EVALUATED (as of 2026-06)
#   Adopted (in packages/cli/src/utils/node.ts):
#     --expose-gc                      always on; enables manual gc() between runs
#     --no-concurrent-sweeping         all nodes; reduces GC thread interference
#     --max-old-space-size=4096        all nodes; caps heap, reduces GC pressure variance
#     --no-opt                         Node 18 only; disables all JIT optimisation
#     --max-opt=1                      Node 19+; caps JIT at Sparkplug, blocks Turbofan/Maglev
#     --no-concurrent-minor-ms-marking Node 22+; disables concurrent young-gen marking (V8 12.x+)
#
#   Ruled out (no reliable improvement):
#     --no-concurrent-marking          negligible / noisy
#     --no-incremental-marking         makes things worse
#     --gc-interval=1000000            makes things worse
#     --single-threaded-gc             neutral or slightly worse
#     --initial-old-space-size=4096    dramatically worse (forces 4 GB upfront allocation)
#     --min/max-semi-space-size=64     neutral
#     --single-generation              worse
#     --separate-gc-phases             worse
#     --no-concurrent-osr              much worse
#     --no-parallel-marking            crashes Node 22 (SIGSEGV in ConcurrentMarkerBase)
#     --predictable-gc-schedule        no reliable effect
#     --no-concurrent-minor-ms-marking confirmed improvement on Node 22 (see above)
#
# =============================================================================

set -e
cd "$(dirname "$0")"

JEST_BIN="/Users/mdj/Development/OpenSource/reassure/node_modules/jest/bin/jest.js"
NODE_FLAGS="$*"

mkdir -p .reassure

echo "════════════════════════════════════════════════════════════"
echo " Node flags: ${NODE_FLAGS:-<none>}"
echo "════════════════════════════════════════════════════════════"
echo ""

run_jest() {
  local label="$1"
  local output_file="$2"
  echo "▶ $label …"
  rm -f "$output_file"
  # shellcheck disable=SC2086
  REASSURE_OUTPUT_FILE="$output_file" \
    REASSURE_SILENT=true \
    REASSURE_VERBOSE=false \
    node $NODE_FLAGS "$JEST_BIN" \
      --runInBand \
      --testRegex='\.perf\.(tsx?|jsx?)$' \
      2>&1 | grep -E '(PASS|FAIL|Tests:|✓|✗|×)' | head -20
  echo ""
}

run_jest "Run 1/2 (baseline)" ".reassure/baseline.perf"
run_jest "Run 2/2 (current)"  ".reassure/current.perf"

echo "▶ Stability:"
node --input-type=commonjs <<'EOF'
const { compare } = require('@callstack/reassure-compare');
compare({ outputFormat: 'console' }).catch(e => { console.error(e); process.exit(1); });
EOF
