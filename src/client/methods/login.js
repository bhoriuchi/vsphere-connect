import soap from 'soap-connect'
import { errorHandler, resultHandler, getSessionId } from '../common'
let CookieSecurity = soap.Security.CookieSecurity

export default function login (args = {}, callback = () => false) {
  let { username, password, sessionId } = args
  return new Promise((resolve, reject) => {
    try {
      if (sessionId) {
        this._cookie = `vmware_soap_session="${sessionId}"`
        this._soapClient.setSecurity(CookieSecurity(this._cookie))
        this._sessionId = sessionId

      } else if (username && password) {
        return this.method('Login', {
          _this: this.serviceContent.sessionManager,
          userName: username,
          password
        }, (err, result) => {
          if (err) return errorHandler(err, callback, reject)
          this._soapClient.setSecurity(CookieSecurity(this._soapClient.lastResponse.headers))
          this._sessionId = getSessionId(this._soapClient.lastResponse.headers)
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