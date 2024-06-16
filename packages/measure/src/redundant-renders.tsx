import type { ReactTestRendererJSON } from 'react-test-renderer';
import { format as prettyFormat, plugins } from 'pretty-format';

export type ElementJsonTree = ReactTestRendererJSON | ReactTestRendererJSON[] | null;

export function detectRedundantUpdates(elementTrees: ElementJsonTree[], initialRenderCount: number): number[] {
  const result = [];

  for (let i = 1; i < elementTrees.length; i += 1) {
    if (isJsonTreeEqual(elementTrees[i], elementTrees[i - 1])) {
      // We want to return correct render index, so we need to take into account:
      // - initial render count that happened before we have access to the element tree
      // - the fact that the last initial render is double counted as first element tree
      result.push(i + initialRenderCount - 1);
    }
  }

  return result;
}

const formatOptionsZeroIndent = {
  plugins: [plugins.ReactTestComponent],
  indent: 0,
};

function isJsonTreeEqual(left: ElementJsonTree | null, right: ElementJsonTree | null): boolean {
  const formattedLeft = prettyFormat(left, formatOptionsZeroIndent);
  const formattedRight = prettyFormat(right, formatOptionsZeroIndent);
  return formattedLeft === formattedRight;
}
