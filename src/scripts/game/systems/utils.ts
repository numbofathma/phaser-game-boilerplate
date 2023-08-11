export function deepClone<T>(objectToClone: T): T {
  return JSON.parse(JSON.stringify(selectFromObj(objectToClone)));
}

export const round = (d: number, digits = 2) => Math.round(d * Math.pow(10, digits)) / Math.pow(10, digits);

export type Primitives =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'function'
  | 'bigint'
  | 'undefined'
  | 'symbol';
export function selectFromObj(
  object: any,
  types: Primitives[] = ['string', 'boolean', 'number'], // printable primitives
  maxDepth: number | { depth: number; count: number } = 3,
  filteredObject: any = {}
) {
  if (['string', 'boolean', 'number'].includes(typeof object)) return object;

  // match type of filtered object
  if (Array.isArray(object) && !Array.isArray(filteredObject)) filteredObject = [];

  if (!object) return filteredObject;

  let count = 100;
  let depth: number;
  if (isPlainObject(maxDepth)) {
    count = maxDepth.count;
    depth = maxDepth.depth;
  } else {
    depth = maxDepth;
  }

  Object.keys(object).forEach((key, index) => {
    if (index >= count) return;

    const objType = typeof object[key];
    if (objType === 'object' && depth > 0) {
      // go deeper
      filteredObject[key] = {};
      selectFromObj(object[key], types, { depth: depth - 1, count }, filteredObject[key]);
      return;
    }

    if (!types.includes(objType)) return;

    // limit max string length roughly
    if (objType === 'string') object[key] = object[key].slice(0, 128);

    // limit key length to prevent db space from blowing
    filteredObject[key.slice(0, 32)] = object[key];
  });

  return filteredObject;
}

export function isPlainObject(obj: any): obj is Record<string, unknown> {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

export function jsonStringifySafe(object: any, replacer = '') {
  return JSON.stringify(selectFromObj(object, undefined, 999), null, replacer);
}
