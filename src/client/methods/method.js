import _ from 'lodash'
import { errorHandler, resultHandler } from '../utils/index'

export default function method (name, args = {}, callback = () => null) {
  return new Promise((resolve, reject) => {
    try {
      let fn = _.get(this._VimPort, `["${name}"]`)
      if (!_.isFunction(fn)) throw new Error(`${name} is not a valid method`)
      fn(args, (err, result) => {
        if (err) return errorHandler (err, callback, reject)
        return resultHandler(_.get(result, 'returnval', result), callback, resolve)
      })
    } catch (err) {
      return errorHandler (err, callback, reject)
    }
  })
}