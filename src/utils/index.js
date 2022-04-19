export function cache(fn) {
  const caches = new WeakMap()
  return function(params, useCache = true) {
    if (!useCache) return fn(params)
    console.log(
      'use cache: ',
      caches.has(params),
      params,
      fn(params),
      caches.get(params)
    )
    return (caches.has(params) ? caches : caches.set(params, fn(params))).get(
      params
    )
  }
}

//without other object except Array and Object
export const cloneDeep = (value) => {
  if (typeof value !== 'object') return value
  const result = value instanceof Array ? [] : {}
  const stack = [{ result, value }]
  while (stack.length > 0) {
    const { result, value } = stack.pop()
    if (!value) continue
    for (const [key, item] of Object.entries(value)) {
      if (typeof item !== 'object') {
        result[key] = item
        continue
      } else if (
        item instanceof Function ||
        item instanceof Map ||
        item instanceof Set ||
        item instanceof Node
      ) {
        result[key] = item
        continue
      }
      result[key] = item instanceof Array ? [] : {}
      stack.push({ result: result[key], value: item })
    }
  }
  return result
}
