import _ from 'lodash'
import { buildMessage } from '../types'
import { errorHandler, resultHandler } from '../common'

export default function method (name, args = {}, callback = () => null) {
  let obj = buildMessage(_.get(this, '_soapClient.wsdl'), name, args)
  return new Promise((resolve, reject) => {
    try {
      let fn = _.get(this._VimPort, `["${name}"]`)
      if (!_.isFunction(fn)) throw new Error(`${name} is not a valid method`)
      fn(obj, (err, result) => {
        if (err) return errorHandler (err, callback, reject)
        return resultHandler(_.get(result, 'returnval', result), callback, resolve)
      })
    } catch (err) {
      return errorHandler (err, callback, reject)
    }
  })
}