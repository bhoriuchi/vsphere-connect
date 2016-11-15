import _ from 'lodash'
import { soap } from 'strong-soap'
import methods from './methods/index'
import { getCache, setCache } from './cache'
import { errorHandler, resultHandler } from './common'

export class VSphereClient {
  constructor (host, options, callback) {
    if (!options) options = {}, callback = () => null
    else if (_.isFunction(options)) options = {}, callback = options
    if (!_.isFunction(callback)) callback = () => null

    return new Promise((resolve, reject) => {
      if (!host) throw new Error('No host specified')
      this._host = host
      this._options = options
      this._endpoint = `https://${this._host}/sdk/vimService`
      this._wsdl = `${this._endpoint}.wsdl`

      let cacheFile = getCache(this._wsdl)
      let soapOptions = { endpoint: this._endpoint }

      if (this._options.ignoreSSL) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

      return soap.createClient(cacheFile || this._wsdl, soapOptions, (err, client) => {
        if (err) return errorHandler(err, callback, reject)
        this._soapClient = client
        this._VimPort = _.get(client, 'VimService.VimPort')
        this.WSDL_CACHE = client.wsdl.WSDL_CACHE

        // retrieve service content
        return this._soapClient.RetrieveServiceContent({
          _this: 'ServiceInstance'
        }, (err, result) => {
          if (err) return errorHandler(err, callback, reject)
          this.serviceContent = _.get(result, 'returnval')
          this.apiVersion = _.get(this.serviceContent, 'about.apiVersion')
          if (!cacheFile) setCache(this.WSDL_CACHE, this._wsdl, this.apiVersion)
          _.forEach(methods, (fn, name) => { this[name] = fn.bind(this) })
          return resultHandler(this, callback, resolve)
        })
      })
    })
  }
}

// convenience method to create a new client
export default function (host, options = {}) {
  return new VSphereClient(host, options)
}