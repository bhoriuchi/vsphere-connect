import _ from 'lodash';
import Promise from 'bluebird';
import soap from '../soap/index';
const CookieSecurity = soap.Security.CookieSecurity;

function getSessionID(headers) {
  return _.get(
    _.get(headers, 'set-cookie[0]', '').match(/"(.*)"/),
    '[1]',
    null,
  );
}

/**
 *
 * @param username {String} - username or token
 * @param password {String} - password (optional if token specified)
 * @return {Promise.<TResult>|*|Promise.<*>}
 */
export default function login(username, password) {
  const isHostAgent =
    _.get(this, 'serviceContent.about.apiType') === 'HostAgent';
  const sid = _.isString(username) && !password ? username : null;

  // session auth
  if (sid) {
    if (isHostAgent) {
      return Promise.reject(
        new Error(
          'token authentication is ' +
            'no supported on host, use username/password',
        ),
      );
    }
    this._sid = sid;
    this.setSecurity(CookieSecurity(`vmware_soap_session="${this._sid}"`));

    return this.retrieve({
      type: 'SessionManager',
      id: 'SessionManager',
      properties: ['currentSession'],
    }).then(sessions => {
      this.loggedIn = true;
      this._session = _.get(sessions, '[0].currentSession');
      return this._session;
    });
  } else if (username && password) {
    return this.method('Login', {
      _this: this.serviceContent.sessionManager,
      userName: username,
      password,
    }).then(session => {
      this.loggedIn = true;
      this._soapClient.setSecurity(
        CookieSecurity(this._soapClient.lastResponse.headers),
      );
      this._sid = getSessionID(this._soapClient.lastResponse.headers);
      this._session = session;
      return this._session;
    });
  }

  return Promise.reject('no credentials provided');
}
