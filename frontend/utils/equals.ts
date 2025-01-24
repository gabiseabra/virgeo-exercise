type Eq<T> = (a: T, b: T) => boolean

export const equals: Eq<unknown> = (a, b) => {
  if (typeof a !== typeof b) return false
  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    return objectEq(a, b)
  }
  return a === b
}

const objectEq: Eq<object> = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return arrayEq(a, b)
  }
  else {
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    if (aKeys.length !== bKeys.length) return false
    // @ts-expect-error
    return aKeys.every(k => equals(a[k], b[k]))
  }
}

const arrayEq: Eq<unknown[]> = (a, b) => (
  a.length === b.length && a.every((v, i) => equals(v, b[i]))
)
