import _ from 'lodash'

function moRef (type, value) {
  let t = _.isString(type) ? type : _.get(type, 'type')
  let v = _.isString(type) ? value : _.get(type, 'value', _.get(type, 'id'))

  if (!t || !v) throw new Error('cannot resolve moRef, missing type info')
  return { type: t, value: v }
}

export { moRef }

export function isMoRef (value) {
  return _.isString(_.get(value, 'type')) && _.isString(_.get(value, 'value', _.get(value, 'id')))
}

export default moRef