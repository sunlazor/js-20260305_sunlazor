/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  let pickedObject = {};
  for (let field of fields) {
    if (obj[field] !== undefined) {
      pickedObject[field] = obj[field];
    }
  }

  return pickedObject;
};
