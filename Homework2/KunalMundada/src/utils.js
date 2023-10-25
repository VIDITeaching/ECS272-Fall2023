export function groupBy(objectArray, property) {
  return objectArray.reduce(function (acc, obj) {
    let key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

export function unroll(rollup, keys, label = "value", p = {}) {
  return Array.from(rollup, ([key, value]) =>
    value instanceof Map
      ? unroll(
          value,
          keys.slice(1),
          label,
          Object.assign({}, { ...p, [keys[0]]: key })
        )
      : Object.assign({}, { ...p, [keys[0]]: key, [label]: value })
  ).flat();
}
