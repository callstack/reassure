/**
 * Check if array has duplicates.
 */
export function hasDuplicateValues(elements: string[]) {
  return elements.length !== new Set(elements).size;
}
