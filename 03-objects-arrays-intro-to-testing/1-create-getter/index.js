/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const paths = path.split('.');
  return function (obj) {
    let pathfinder = obj;
    for (const ph of paths) {
      if (pathfinder == null || !Object.hasOwn(pathfinder, ph)) {
        return undefined;
      }

      pathfinder = pathfinder[ph];
    }

    return pathfinder;
  };
}
