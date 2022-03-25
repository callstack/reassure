/**
 * Check if array has duplicates.
 */
export function hasDuplicateValues<T>(elements: T[]) {
  return elements.length !== new Set(elements).size;
}

// export function findDuplicates<T>(elements: T[]) {
//   const duplicates: T[] = [];

//   const counts = new Map<any, number>();
//   elements.forEach((element) => {
//     const previousCount = counts.get(element) ?? 0;
//     counts.set(element);
//   });
// }
