/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const arrToSort = [...arr];
  return arrToSort.sort((a, b) => {
    let compareResult = a.localeCompare(
      b, ['ru', 'en'], {'caseFirst': 'upper', 'sensitivity': 'variant'}
    );
    const direction = param === 'asc' ? 1 : -1;

    return compareResult * direction;
  });
}
