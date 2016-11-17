import _ from 'lodash'
import { soap } from 'strong-soap'
import methods from './methods/index'
import query from './query'
import { makeDotPath } from './common'
import { getCache, setCache } from './cache'

export class v {
  constructor (client, value = null, chain = [], prev = null, type = null) {
    this._client = client
    this._value = value
    this._chain = chain
    this._prev = prev
    this._type = type
  }

  // allow direct access to the client
  client (callback = () => false) {
    return new Promise((resolve, reject) => {
      return this._client._connection
        .then(() => {
          callback(null, this._client)
          return resolve(this._client)
        })
        .catch((err) => {
          callback(err)
          return reject(err)
        })
    })
  }

  type (name) {
    if (!name) throw new Error('type method requires a type name')
    return new v(this._client, null, [], null, name)
  }

  pluck () {
    let method = 'pluck'
    let props = []
    let args = [...arguments]
    if (!this._type) throw new Error('a type must be selected first')
    if (!args.length) throw new Error('pluck requires one or more fields')
    _.forEach(args, (arg) => {
      if (_.isString(arg)) {
        props = _.union(props, [arg])
      } else if (_.isArray(arg)) {
        props = _.union(props, arg)
      } else if (_.isObject(arg)) {
        props = _.union(props, makeDotPath(arg))
      }
    })
    this._chain.push({ method, prev: this._prev, props })
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