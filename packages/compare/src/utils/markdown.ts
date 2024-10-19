import { lineBreak } from 'ts-markdown-builder';

/**
 * Join lines of text into a single paragraph string with line breaks.
 *
 * @param lines - The lines of text to join.
 * @returns Paragraph string.
 */
export function joinLines(lines: string[]) {
  return lines.filter(Boolean).join(lineBreak);
}
