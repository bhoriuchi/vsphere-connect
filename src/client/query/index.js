import _ from 'lodash'
import soap from 'soap-connect'
import get from './get'
import { buildPropList } from '../utils/index'

const ENTITY = 'entity'
const LIST = 'list'

let CookieSecurity = soap.Security.CookieSecurity

export default function query (q) {
  let [ limit, offset, val, id ] = [ null, null, null, null ]
  let [ breakLoop, resolveRequired ] = [ false, false ]
  let [ idx, properties ] = [ 0, [] ]
  let [ chain, len, client, type ] = [ q._chain, q._chain.length, q._client, q._type ]
  let queryType = q._type ? LIST : null
  type = type ? client.typeResolver(type) : type

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
        id = c.id
        if (isLast) {
          if (!type) return Promise.reject(new Error('no type specified'))
          return get(client, type, id, properties)
        }
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
        if (isLast) {
          if (!type) return Promise.reject(new Error('no type specified'))
          if (!properties.length) return Promise.reject(new Error('no properties specified'))
          return get(client, type, id, properties)
        }
        break

      default:
        break
    }
    if (breakLoop) return val
    idx++
  }
  return val
}