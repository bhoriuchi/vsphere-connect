import Promise from 'bluebird'
import { errorHandler, resultHandler } from '../utils/index'

export default function reload (args = {}, callback = () => false) {
  return new Promise((resolve, reject) => {
    let { type, id, moRef } = args
    let typeName = this.typeResolver(type)
    let obj = moRef || { type: typeName, value: id }
    if (!moRef && !type && !id) return errorHandler(new Error('no object specified to reload'), callback, reject)
    return this.method('Reload', { _this: obj }, (err) => {
      return err ? errorHandler(err, callback, reject) : resultHandler({ reload: true }, callback, resolve)
    })
  })
}