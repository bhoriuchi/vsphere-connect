import _ from 'lodash'
import soap from 'soap-connect'
import { errorHandler, resultHandler } from '../utils/index'
let CookieSecurity = soap.Security.CookieSecurity

function getToken(headers) {
  return _.get(_.get(headers, 'set-cookie[0]', '').match(/"(.*)"/), '[1]', null)
}

export default function login (args = {}, callback = () => false) {
  let { username, password, token } = args
  let isHostAgent = _.get(this, 'serviceContent.about.apiType') === 'HostAgent'
  return new Promise((resolve, reject) => {
    try {
      if (token) {
        if (isHostAgent) throw new Error('token/cookie authentication is not supposted when connecting to a host, ' +
          'please use username/password')
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
          if (err) throw err
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