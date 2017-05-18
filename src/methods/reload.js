import _ from 'lodash'
import Promise from 'bluebird'

export default function reload (args = {}) {
  let ops = _.without(_.map(_.castArray(args), val => {
    let { type, id, moRef } = _.isObject(val) ? args : {}
    let typeName = this.typeResolver(type)
    moRef = moRef || { type: typeName, value: id }

    return _.isEmpty(moRef) || !_.isString(name)
      ? null
      : { _this: moRef }
  }), null)

  if (!ops.length) return Promise.reject('invalid reload arguments')

  let tasks = _.map(ops, arg => {
    return this.method('Reload', arg)
      .then(() => ({ reload: true }))
  })

  return Promise.all(tasks)
    .then(results => {
      return _.isArray(args)
        ? results
        : _.first(results)
    })
}