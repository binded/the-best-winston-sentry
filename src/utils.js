const filterObjKey = (obj, filterFn) => Object
  .keys(obj)
  .filter(filterFn)
  .reduce((acc, k) => Object.assign(acc, {
    [k]: obj[k],
  }), {})

const omit = (obj, keys) => filterObjKey(obj, k => !keys.includes(k))
const pick = (obj, keys) => filterObjKey(obj, k => keys.includes(k))

module.exports = { omit, pick }
