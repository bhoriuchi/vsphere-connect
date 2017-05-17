import _ from 'lodash'
import Promise from 'bluebird'

export default function reload (args) {
  let { type, id, moRef } = _.isFunction(args) ? args : {}
  let typeName = this.typeResolver(type)
  let obj = moRef || { type: typeName, value: id }

  if (!moRef && !type && !id) return Promise.reject(new Error('no object specified to reload'))

  return this.method('Reload', { _this: obj })
    .then(() => ({ reload: true }))
}