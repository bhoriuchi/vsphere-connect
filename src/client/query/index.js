import _ from 'lodash'
import soap from 'soap-connect'
import get from './get'
import { buildPropList } from '../utils/index'

const ENTITY = 'entity'
const LIST = 'list'

let CookieSecurity = soap.Security.CookieSecurity

export default function query (q) {
  let [ limit, offset, val ] = [ null, null, null ]
  let [ idx, breakLoop, properties ] = [ 0, false, [] ]
  let [ chain, len, client, type ] = [ q._chain, q._chain.length, q._client, q._type ]
  let queryType = q._type ? LIST : null

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
      case 'get':
        if (!type) return Promise.reject(new Error('no type specified'))
        queryType = ENTITY
        val = get(client, type, c.id, properties)
        break

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
        val = client.retrieve(c.args, { maxObjects: limit })
        break

      case 'pluck':
        properties = buildPropList(c.args)
        break

      default:
        break
    }
    if (breakLoop) return val
    idx++
  }
  return val
}