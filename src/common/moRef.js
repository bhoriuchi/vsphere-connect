import _ from 'lodash'

export default function moRef (type, value) {
  let t = _.isString(type) ? type : _.get(type, 'type')
  let v = _.isString(type) ? value : _.get(type, 'value', _.get(type, 'id'))

  if (!t || !v) throw new Error('cannot resolve moRef, missing type info')
  return { type: t, value: v }
}