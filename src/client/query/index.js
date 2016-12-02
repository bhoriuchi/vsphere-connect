import _ from 'lodash'
import soap from 'soap-connect'
import { makeDotPath } from '../utils/index'
let CookieSecurity = soap.Security.CookieSecurity

export default function query (q) {
  let [ idx, val, breakLoop, props ] = [ 0, null, false, [] ]
  let [ chain, len, client, type ] = [ q._chain, q._chain.length, q._client, q._type ]

  // check for a new instantiation
  if (!len) {
    if (type) {
      return client.retrieve({ type })
    }
    return Promise.reject(new Error('Invalid query chain'))
  }

  for (let c of chain) {
    let isLast = idx === (len - 1)
    switch (c.method) {
      case 'logout':
        val = client.logout()
        breakLoop = true
        break

      case 'session':
        val = Promise.resolve(q._session)
        break

      case 'token':
        if (c.token) client.setSecurity(CookieSecurity(`vmware_soap_session="${this._token}"`))
        val = Promise.resolve(q._token)
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