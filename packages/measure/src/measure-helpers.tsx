import * as math from 'mathjs';
import type { MeasureResults } from './types';

export interface RunResult {
  duration: number;
  count: number;
}

export function processRunResults(results: RunResult[], warmupRuns: number): MeasureResults {
  results = results.slice(warmupRuns);
  results.sort((first, second) => second.duration - first.duration); // duration DESC

  const durations = results.map((result) => result.duration);
  const meanDuration = math.mean(durations) as number;
  const stdevDuration = math.std(...durations);

  const counts = results.map((result) => result.count);
  const meanCount = math.mean(counts) as number;
  const stdevCount = math.std(...counts);

  return {
    runs: results.length,
    meanDuration,
    stdevDuration,
    durations,
    meanCount,
    stdevCount,
    counts,
  };
}

export interface ComponentNode {
  type: string;
  props: { [key: string]: any };
  children?: ComponentNode[];
}

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

export function dfs(nodes: ComponentNode[], prevNode: ComponentNode | null = null): boolean {
  let count = 0;
  for (const node of nodes) {
    if (!node && !prevNode) {
      count++;
    }

    if (
      prevNode &&
      prevNode.type === node.type &&
      deepEqual(prevNode.props, node.props) &&
      deepEqual(prevNode?.children, node?.children)
    ) {
      count++;
    }

    if (node?.children && dfs(node?.children, node)) {
      count++;
    }
    prevNode = node;
  }

  return count >= 1;
}
