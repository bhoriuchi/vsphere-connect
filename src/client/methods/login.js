import _ from 'lodash'
import soap from 'strong-soap'
import { errorHandler, resultHandler, getSessionId } from '../common'

export function getSoapCookie (lastResponseHeaders) {
  return _.get(_.get(lastResponseHeaders, '["set-cookie"][0]', '').split(';'), '[0]', '')
}

export default function login (args = {}, callback = () => false) {
  let { username, password, sessionId } = args
  return new Promise((resolve, reject) => {
    try {
      if (sessionId) {
        this._cookie = `vmware_soap_session="${sessionId}"`
        this._soapClient.setSecurity(new soap.CookieSecurity(this._cookie))
        this._sessionId = sessionId

      } else if (username && password) {
        return this.method('Login', {
          _this: this.serviceContent.sessionManager,
          userName: username,
          password
        }, (err, result) => {
          if (err) return errorHandler(err, callback, reject)
          this._cookie = getSoapCookie(this._soapClient.lastResponseHeaders)
          this._soapClient.setSecurity(new soap.CookieSecurity(this._cookie))
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