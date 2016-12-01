import _ from 'lodash'
import soap from 'soap-connect'
import { makeDotPath } from './common'
let CookieSecurity = soap.Security.CookieSecurity

export default function query (q) {
  let [ idx, val, breakLoop, type, props ] = [ 0, null, false, null, [] ]
  let [ chain, len, client ] = [ q._chain, q._chain.length, q._client ]

  for (let c of chain) {
    switch (c.method) {
      case 'logout':
        val = client.logout()
        breakLoop = true
        break

      case 'session':
        val = Promise.resolve(q._session)
        break

      case 'token':
        if (c.token) client._soapClient.setSecurity(CookieSecurity(`vmware_soap_session="${this._token}"`))
        val = Promise.resolve(q._token)
        break

      case 'on':
        client._soapClient.on(c.evt, c.handler)
        val = null
        break

      case 'type':
        type = c.name
        break

      case 'retrieve':
        val = client.retrieve(c.args)
        break

      case 'pluck':
        props = []
        _.forEach(c.args, (arg) => {
          if (_.isString(arg)) {
            props = _.union(props, [arg])
          } else if (_.isArray(arg)) {
            props = _.union(props, arg)
          } else if (_.isObject(arg)) {
            props = _.union(props, makeDotPath(arg))
          }
        })
        break

      default:
        break
    }
    if (breakLoop) return val
    idx++
  }
  return val
}