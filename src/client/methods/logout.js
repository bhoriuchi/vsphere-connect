import Promise from 'bluebird'
import { errorHandler, resultHandler } from '../utils/index'

export default function logout (callback = () => false) {
  return new Promise((resolve, reject) => {
    return this.method('Logout', { _this: this.serviceContent.sessionManager }, (err) => {
      return err ? errorHandler(err, callback, reject) : resultHandler({ logout: true }, callback, resolve)
    })
  })
}