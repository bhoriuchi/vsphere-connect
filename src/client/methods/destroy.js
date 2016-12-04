import _ from 'lodash'
import { errorHandler, resultHandler } from '../utils/index'
import monitor from '../monitor/index'

export default function destroy (args = {}, options, callback) {
  if (_.isFunction(options)) {
    callback = options
    options = {}
  }
  callback = _.isFunction(callback) ? callback : () => null
  return new Promise((resolve, reject) => {
    let { type, id, moRef } = args
    let obj = moRef || { type, value: id }
    if (!moRef && !type && !id) errorHandler(new Error('no object specified to destroy'), callback, reject)
    return this.method('Destroy_Task', { _this: obj }, (err, result) => {
      if (err ) return errorHandler(err, callback, reject)
      if (options.async === false) {
        return monitor.task(this, _.get(result, 'moRef.value'), options, callback)
      }
      return resultHandler(result, callback, resolve)
    })
  })
}