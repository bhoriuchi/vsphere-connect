import _ from 'lodash'
import Promise from 'bluebird'
import soap from 'soap-connect'
let CookieSecurity = soap.Security.CookieSecurity

function getToken(headers) {
  return _.get(_.get(headers, 'set-cookie[0]', '').match(/"(.*)"/), '[1]', null)
}

export default function login (args) {
  let { username, password, token } = _.isObject(args) ? args : {}
  let isHostAgent = _.get(this, 'serviceContent.about.apiType') === 'HostAgent'

  // token auth
  if (token) {
    if (isHostAgent) {
      return Promise.reject(new Error('token authentication is no supported on host, use username/password'))
    }
    this._token = token
    this.setSecurity(CookieSecurity(`vmware_soap_session="${this._token}"`))

    return this.retrieve({
      type: 'SessionManager',
      id: 'SessionManager',
      properties: ['currentSession']
    })
      .then(sessions => {
        this._session = _.get(sessions, '[0].currentSession')
        return this._session
      })
  }

  // basic auth
  else if (username && password) {
    return this.method('Login', {
      _this: this.serviceContent.sessionManager,
      userName: username,
      password
    })
      .then(session => {
        this._soapClient.setSecurity(CookieSecurity(this._soapClient.lastResponse.headers))
        this._token = getToken(this._soapClient.lastResponse.headers)
        this._session = session
        return this._session
      })
  }

  return Promise.reject('no credentials provided')
}