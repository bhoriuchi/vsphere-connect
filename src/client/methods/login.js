import _ from 'lodash'
import soap from 'soap-connect'
import { errorHandler, resultHandler, getToken } from '../common'
let CookieSecurity = soap.Security.CookieSecurity

export default function login (args = {}, callback = () => false) {
  let { username, password, token } = args
  return new Promise((resolve, reject) => {
    try {
      if (token) {
        this._token = token
        this.setSecurity(CookieSecurity(`vmware_soap_session="${this._token}"`))
        return this.retrieve({
          type: 'SessionManager',
          id: 'SessionManager',
          properties: ['currentSession']
        }, (err, sessions) => {
          if (err) return errorHandler(err, callback, reject)
          this._session = _.get(sessions, '[0].currentSession')
          return resultHandler(this._session, callback, resolve)
        })
      } else if (username && password) {
        return this.method('Login', {
          _this: this.serviceContent.sessionManager,
          userName: username,
          password
        }, (err, session) => {
          if (err) return errorHandler(err, callback, reject)
          this._soapClient.setSecurity(CookieSecurity(this._soapClient.lastResponse.headers))
          this._token = getToken(this._soapClient.lastResponse.headers)
          this._session = session
          return resultHandler(this._session, callback, resolve)
        })
      }
      throw new Error('No credentials provided. A username/password or sessionId must be provided to login')
    } catch (err) {
      return errorHandler(err, callback, reject)
    }
  })
}