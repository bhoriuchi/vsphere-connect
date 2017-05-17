import _ from 'lodash'

export default function moRef (typeValue, value) {
  if (_.isObject(typeValue) && !value) {
    let { type, value, id } = typeValue
    if (!type && !value && !id) return new Error('cannot resolve moRef, missing type info')
  }
  return { type: typeValue, value }
}