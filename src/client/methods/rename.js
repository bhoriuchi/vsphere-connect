import _ from 'lodash'
import Promise from 'bluebird'
import { errorHandler, resultHandler } from '../utils/index'
import monitor from '../monitor/index'

export default function rename (args = {}, options, callback) {
  if (_.isFunction(options)) {
    callback = options
    options = {}
  }
  callback = _.isFunction(callback) ? callback : () => null
  options = options || {}

  return new Promise((resolve, reject) => {
    let { type, id, moRef, name } = args
    let typeName = this.typeResolver(type)
    let obj = moRef || { type: typeName, value: id }
    if (!moRef && !type && !id) return errorHandler(new Error('no object specified to destroy'), callback, reject)
    if (!_.isString(name)) return errorHandler(new Error('invalid name or name not specified'), callback, reject)
    return this.method('Rename_Task', { _this: obj, newName: name }, (err, result) => {
      if (err) return errorHandler(err, callback, reject)
      if (options.async === false) {
        return monitor.task(this, _.get(result, 'value'), options, (err, result) => {
          if (err) return errorHandler(err, callback, reject)
          return resultHandler(result, callback, resolve)
        })
      }
      return resultHandler(result, callback, resolve)
    })
  })
}