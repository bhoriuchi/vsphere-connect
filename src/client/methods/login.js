import Cookie from 'soap-cookie'
import { errorHandler, resultHandler, getSessionId } from '../common'

export class CookieSecurity {
  constructor (cookie, options) {
    this.cookie = cookie
  }
  addHttpHeaders (headers) {
    headers.Cookie = this.cookie
  }
}

export default function login (args = {}, callback = () => false) {
  let { username, password, sessionId } = args
  return new Promise((resolve, reject) => {
    try {
      if (username && password) {
        return this.method('Login', {
          _this: this.serviceContent.sessionManager,
          userName: username,
          password
        }, (err, result) => {
          if (err) return errorHandler(err, callback, reject)
          this._cookie = new Cookie(this._soapClient.lastResponseHeaders)
          this._soapClient.setSecurity(new CookieSecurity(this._cookie.cookies))
          this._sessionId = getSessionId(this._cookie)
          this._session = result
          return resultHandler(result, callback, resolve)
        })
      }
      throw new Error('No credentials provided. A username/password or sessionId must be provided to login')
    } catch (err) {
      return errorHandler(err, callback, reject)
    }
  })
}