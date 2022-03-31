/**
 * Check if array has duplicates.
 */
export function hasDuplicateValues<T>(elements: T[]) {
  return elements.length !== new Set(elements).size;
}
