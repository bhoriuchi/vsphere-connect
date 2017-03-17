import _ from 'lodash'
import Promise from 'bluebird'
import monitor from '../monitor/index'

export default function rename (args, options) {
  let { type, id, moRef, name } = _.isObject(args) ? args : {}
  let typeName = this.typeResolver(type)
  let obj = moRef || { type: typeName, value: id }
  options = _.isObject(options) ? options : {}

  if (!moRef && !type && !id) return Promise.reject(new Error('no object specified'))
  if (!_.isString(name)) return Promise.reject(new Error('invalid name'))

  return this.method('Rename_Task', { _this: obj, newName: name })
    .then(task => {
      return (options.async !== false)
        ? task
        : monitor.task(this, _.get(task, 'value'), options)
    })
}