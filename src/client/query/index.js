import _ from 'lodash'
import soap from 'soap-connect'
import get from './get'
import { buildPropList } from '../utils/index'
import ENUMS from './enums'
let { RESULT_TYPE: { OBJECT, COLLECTION, STRING } } = ENUMS

let CookieSecurity = soap.Security.CookieSecurity

export default function query (q) {
  let [ limit, offset, val, id ] = [ null, null, null, null ]
  let [ resolveRequired ] = [ false ]
  let [ idx, properties ] = [ 0, [] ]
  let [ chain, len, client, type ] = [ q._chain, q._chain.length, q._client, q._type ]
  let resultType = type ? COLLECTION : null
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
        resultType = OBJECT
        id = c.id
        if (isLast) return get(client, type, id, properties)
        break

      case 'getAll':
        if (!type) return Promise.reject(new Error('no type specified'))
        resultType = COLLECTION
        break

      case 'logout':
        return client.logout()

      case 'session':
        resultType = STRING
        val = Promise.resolve(q._session)
        break

      case 'token':
        if (c.token) client.setSecurity(CookieSecurity(`vmware_soap_session="${this._token}"`))
        resultType = STRING
        val = Promise.resolve(q._token)
        break

      case 'retrieve':
        resultType = COLLECTION
        val = client.retrieve(c.args, { maxObjects: limit })
        break

      case 'pluck':
        if (!_.includes([OBJECT, COLLECTION], resultType)) throw new Error('an object or collection has not been selected')
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
    idx++
  }
  return val
}