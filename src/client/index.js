import _ from 'lodash'
import { soap } from 'strong-soap'
import methods from './methods/index'
import { getCache, setCache } from './cache'

export function query (q) {
  let [ idx, val, chain, len, breakLoop, type ] = [ 0, null, q._chain, q._chain.length, false, null ]

  for (let c of chain) {
    switch (c.method) {
      case 'logout':
        val = q.client.logout()
        breakLoop = true
        break

      case 'type':
        type = c.name
        break

      default:
        break
    }
    if (breakLoop) return val
    idx++
  }
  return val
}

export class v {
  constructor (client, value = null, chain = [], prev = null, type = null) {
    this.client = client
    this._value = value
    this._chain = chain
    this._prev = prev
    this._type = type
  }

  type (name) {
    let method = 'type'
    this._chain.push({ method, prev: this._prev, name })
    this._prev = method
    return this
  }

  logout () {
    let method = 'logout'
    this._chain.push({ method, prev: this._prev })
    this._prev = method
    return this
  }

  run () {
    return this.client._connection.then(() => {
      return query(this)
    })
  }
}

export class VSphereClient {
  constructor (host, options = {}) {
    if (!host) throw new Error('No host specified')
    this._host = host
    this._options = options
    this._endpoint = `https://${this._host}/sdk/vimService`
    this._wsdl = `${this._endpoint}.wsdl`

    let cacheFile = getCache(this._wsdl)
    let soapOptions = { endpoint: this._endpoint }

    if (this._options.ignoreSSL) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    this._connection = new Promise((resolve, reject) => {
      return soap.createClient(cacheFile || this._wsdl, soapOptions, (err, client) => {
        if (err) return reject(err)
        this._soapClient = client
        this._VimPort = _.get(client, 'VimService.VimPort')
        this.WSDL_CACHE = client.wsdl.WSDL_CACHE

        // retrieve service content
        return this._soapClient.RetrieveServiceContent({ _this: 'ServiceInstance' }, (err, result) => {
          if (err) return reject(err)
          this.serviceContent = _.get(result, 'returnval')
          this.apiVersion = _.get(this.serviceContent, 'about.apiVersion')
          if (!cacheFile) setCache(this.WSDL_CACHE, this._wsdl, this.apiVersion)
          _.forEach(methods, (fn, name) => { this[name] = fn.bind(this) })

          if (options.login !== false) {
            return this.login(this._options)
              .then((session) => {
                this.session = session
                return resolve()
              })
              .catch(reject)
          }
          return resolve()
        })
      })
    })

    return new v(this)
  }
}

// convenience method to create a new client
export default function (host, options = {}) {
  return new VSphereClient(host, options)
}