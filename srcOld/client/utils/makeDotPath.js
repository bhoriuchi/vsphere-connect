import _ from 'lodash'

export default function makeDotPath (obj, list = [], path = []) {
  _.forEach(obj, (val, key) => {
    let prop = path.slice(0)
    prop.push(key)
    if (val === true) list.push(prop.join('.'))
    else makeDotPath(val, list, prop)
  })
  return list
}