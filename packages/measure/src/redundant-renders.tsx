import type { ReactTestRendererJSON } from 'react-test-renderer';
import { format as prettyFormat, plugins } from 'pretty-format';

export type ElementJsonTree = ReactTestRendererJSON | ReactTestRendererJSON[] | null;

export function detectRedundantUpdates(elementTrees: ElementJsonTree[]): number[] {
  const result = [];

  for (let i = 1; i < elementTrees.length; i += 1) {
    if (isJsonTreeEqual(elementTrees[i], elementTrees[i - 1])) {
      result.push(i);
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
