import _ from 'lodash'
import Promise from 'bluebird'
import monitor from '../monitor/index'

export default function destroy (args = {}, options) {
  options = _.isObject(options) ? options : {}
  let ops = _.without(_.map(_.castArray(args), val => {
    let { type, id, moRef } = _.isObject(val) ? args : {}
    let typeName = this.typeResolver(type)
    moRef = moRef || { type: typeName, value: id }

    return _.isEmpty(moRef) || !_.isString(name)
      ? null
      : { _this: moRef }
  }), null)

  if (!ops.length) return Promise.reject('invalid destroy arguments')

  let tasks = _.map(ops, arg => {
    return this.method('Destroy_Task', arg)
      .then(task => {
        return (options.async !== false)
          ? task
          : monitor.task(this, _.get(task, 'value'), options)
      })
  })

  return Promise.all(tasks)
    .then(results => {
      return _.isArray(args)
        ? results
        : _.first(results)
    })
}