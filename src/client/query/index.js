import _ from 'lodash'
import soap from 'soap-connect'
import Promise from 'bluebird'
import get from './get'
import { buildPropList, pluck } from '../utils/index'
import ENUMS from './enums'
let { RESULT_TYPE: { VIM_OBJECT, VIM_COLLECTION, OBJECT, COLLECTION, STRING, ARRAY } } = ENUMS

let CookieSecurity = soap.Security.CookieSecurity

export default function query (q) {
  let [ limit, offset, val, id ] = [ null, null, null, null ]
  let [ idx, properties ] = [ 0, [] ]
  let [ chain, len, client, type ] = [ q._chain, q._chain.length, q._client, q._type ]
  let resultType = type ? VIM_COLLECTION : null
  type = type ? client.typeResolver(type) : type

  // check for a new instantiation
  if (!len) {
    if (type) return client.retrieve({ type })
    return Promise.reject(new Error('Invalid query chain'))
  }

  for (let c of chain) {
    let isLast = idx === (len - 1)
    switch (c.method) {
      case 'get':
        if (!type) return Promise.reject(new Error('no type specified'))
        id = c.id
        resultType = VIM_OBJECT
        if (isLast) return get(client, type, id, limit, offset, properties)
        break

      case 'getAll':
        if (!type) return Promise.reject(new Error('no type specified'))
        resultType = VIM_COLLECTION
        break

      case 'limit':
        limit = c.limit
        break

      case 'logout':
        return client.logout()

      case 'nth':
        let handleNth = (result) => {
          if (!_.isArray(result)) throw new Error('cannot get nth on non-array')
          if (result.length - 1 < c.nth) {
            if (c.default === undefined) throw new Error('invalid index')
            return c.default
          }
          return result[c.nth]
        }

        switch (resultType) {
          case VIM_COLLECTION:
            val = get(client, type, id, properties, limit, offset, false).then(handleNth)
            resultType = OBJECT
            break
          case COLLECTION:
            val = val.then(handleNth)
            resultType = OBJECT
            break
          case ARRAY:
            val = val.then(handleNth)
            resultType = OBJECT
            break
          default:
            return Promise.reject(new Error('cannot get nth on non list types'))
        }
        break

      case 'offset':
        offset = c.offset
        break

      case 'pluck':
        properties = buildPropList(c.args)
        if (!properties.length) return Promise.reject(new Error('no properties specified'))
        if (resultType === VIM_COLLECTION || resultType === VIM_OBJECT) {
          val = get(client, type, id, properties, limit, offset, false)
          resultType = resultType === VIM_COLLECTION ? COLLECTION : OBJECT
        } else if (resultType === COLLECTION || resultType === OBJECT) {
          if (!(val instanceof Promise)) return Promise.reject(new Error('no selection found'))
          val = val.then((v) => {
            return pluck(v, properties)
          })
        }
        break

      case 'retrieve':
        val = client.retrieve(c.args, { maxObjects: limit })
        resultType = VIM_COLLECTION
        break

      case 'session':
        val = Promise.resolve(q._session)
        resultType = STRING
        break

      case 'token':
        if (c.token) client.setSecurity(CookieSecurity(`vmware_soap_session="${this._token}"`))
        val = Promise.resolve(q._token)
        resultType = STRING
        break

      default:
        break
    }
    idx++
  }
  return val
}