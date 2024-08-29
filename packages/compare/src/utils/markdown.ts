import { lineBreak } from 'ts-markdown-builder';

/**
 * Join blocks of text into a single markdown document (string).
 *
 * @param blocks - The blocks of text to join.
 * @returns Markdown document string.
 */
export function joinBlocks(blocks: readonly string[]): string {
  return blocks.filter(Boolean).map(trimBlock).join('\n\n');
}

/**
 * Join lines of text into a single paragraph string with line breaks.
 *
 * @param lines - The lines of text to join.
 * @returns Paragraph string.
 */
export function joinLines(lines: string[]) {
  return lines.filter(Boolean).join(lineBreak);
}

function trimBlock(block: string): string {
  return block.replace(/^\n+|\n+$/g, '');
}
