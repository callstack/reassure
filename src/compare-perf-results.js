const fs = require('fs/promises');

const { baselineFilePath = 'baseline.txt', currentFilePath = 'current.txt' } =
  require('minimist')(process.argv);

async function loadFile(file) {
  try {
    const data = await fs.readFile(file, 'utf8');
    const lines = data.split(/\r?\n/);
    const entries = lines
      .filter((line) => !!line.trim())
      .map((line) => JSON.parse(line));

    const result = {};
    for (const item of entries) {
      result[item.name] = item;
    }
    return result;
  } catch (error) {
    console.error(`Error loading file ${file}`, error);
  }
}

async function main() {
  const baseline = await loadFile(baselineFilePath);
  const current = await loadFile(currentFilePath);

  const keys = [
    ...new Set([...Object.keys(baseline), ...Object.keys(current)]),
  ];
  const stats = keys
    .map((key) => generateLineStats(key, baseline[key], current[key]))
    .filter(Boolean);

  const significant = stats.filter((item) => item.status === 'SIGNIFICANT');
  significant.sort((a, b) => b.durationDiff - a.durationDiff);
  console.log('Significant changes:');
  significant.forEach(printLine);
  console.log();

  const nonSignificant = stats.filter(
    (item) => item.status === 'NON-SIGNIFICANT'
  );
  nonSignificant.sort((a, b) => b.durationDiff - a.durationDiff);
  console.log('Non-significant changes:');
  nonSignificant.forEach(printLine);
  console.log();

  const meaningless = stats.filter((item) => item.status === 'MEANINGLESS');
  meaningless.sort((a, b) => b.durationDiff - a.durationDiff);
  console.log('Meaningless changes:');
  meaningless.forEach(printLine);
  console.log();

  const countChanges = stats.filter((item) => item.countDiff);
  countChanges.sort((a, b) => b.countDiff - a.countDiff);
  console.log('Render count changes:');
  countChanges.forEach(printLine);
  console.log();

  const added = stats.filter((item) => !item.baseline);
  added.sort((a, b) => b.current.meanDuration - a.current.meanDuration);
  console.log('Added tests:');
  added.forEach(printAdded);
  console.log();

  const removed = stats.filter((item) => !item.current);
  removed.sort((a, b) => b.baseline.meanDuration - a.baseline.meanDuration);
  console.log('Removed tests:');
  removed.forEach(printRemoved);
  console.log();
}

const PROBABILITY_CONSIDERED_SIGNIFICANT = 0.02;
const PROBABILITY_CONSIDERED_MEANINGLESS = 0.05;

function generateLineStats(name, baseline, current) {
  if (!baseline || !current) {
    return { name, baseline, current };
  }

  const durationDiff = current.meanDuration - baseline.meanDuration;
  const durationDiffPercent = (durationDiff / baseline.meanDuration) * 100;
  const countDiff = current.meanCount - baseline.meanCount;
  const countDiffPercent = (countDiff / baseline.meanCount) * 100;

  const z = computeZ(
    baseline.meanDuration,
    baseline.stdevDuration,
    current.meanDuration,
    current.runs
  );
  const prob = computeProbability(z);

  let status = 'NON-SIGNIFICANT';
  if (prob < PROBABILITY_CONSIDERED_SIGNIFICANT && Math.abs(durationDiff) > 3)
    status = 'SIGNIFICANT';
  if (prob > PROBABILITY_CONSIDERED_MEANINGLESS || Math.abs(durationDiff) < 1)
    status = 'MEANINGLESS';

  return {
    name,
    status,
    baseline,
    current,
    durationDiff,
    durationDiffPercent,
    countDiff,
    countDiffPercent,
  };
}

main();

// Based on https://github.com/v8/v8/blob/master/test/benchmarks/csuite/compare-baseline.py
function computeZ(baseline_avg, baseline_sigma, mean, n) {
  if (baseline_sigma == 0) return 1000;
  return Math.abs((mean - baseline_avg) / (baseline_sigma / Math.sqrt(n)));
}

function computeProbability(z) {
  if (z > 2.575_829)
    // p 0.005: two sided < 0.01
    return 0;
  if (z > 2.326_348)
    // p 0.010
    return 0.01;
  if (z > 2.170_091)
    // p 0.015
    return 0.02;
  if (z > 2.053_749)
    // p 0.020
    return 0.03;
  if (z > 1.959_964)
    // p 0.025: two sided < 0.05
    return 0.04;
  if (z > 1.880_793)
    // p 0.030
    return 0.05;
  if (z > 1.811_91)
    // p 0.035
    return 0.06;
  if (z > 1.750_686)
    // p 0.040
    return 0.07;
  if (z > 1.695_397)
    // p 0.045
    return 0.08;
  if (z > 1.644_853)
    // p 0.050: two sided < 0.10
    return 0.09;
  if (z > 1.281_551)
    // p 0.100: two sided < 0.20
    return 0.1;
  return 0.2; // two sided p >= 0.20
}

function formatPercentChange(value) {
  if (value >= 0.05) return `+${value.toFixed(1)}%`;
  if (value <= -0.05) return `${value.toFixed(1)}%`;
  return `±${value.toFixed(1)}`;
}

function formatDuration(duration) {
  if (duration < 10) {
    return `${duration.toFixed(1)} ms`;
  }
  return `${duration.toFixed(1)} ms`;
}

function formatCount(value) {
  return value;
}

function formatCountChange(value) {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return `±${value}`;
}

function printLine(item) {
  console.log(
    ` - ${item.name}: ${formatPercentChange(
      item.durationDiffPercent
    )} (${formatDuration(item.baseline.meanDuration)} => ${formatDuration(
      item.current.meanDuration
    )}) | ${formatCountChange(item.countDiff)} (${formatCount(
      item.baseline.meanCount
    )} => ${formatCount(item.current.meanCount)})`
  );
}

function printAdded(item) {
  console.log(
    ` - ${item.name}: ${formatDuration(
      item.current.meanDuration
    )} | ${formatCount(item.current.meanCount)}`
  );
}

function printRemoved(item) {
  console.log(
    ` - ${item.name}: ${formatDuration(
      item.baseline.meanDuration
    )} | ${formatCount(item.baseline.meanCount)}`
  );
}
