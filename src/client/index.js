import _ from 'lodash'
import EventEmitter from 'events'
import soap from 'soap-connect'
import v from './v'
import methods from './methods/index'
import { cacheKey, typeResolver } from './utils/index'

export class VSphereClient extends EventEmitter {
  constructor (host, options = {}) {
    super()
    if (!host) throw new Error('No host specified')
    this._host = host
    this._options = options
    this._options.cacheKey = this._options.cacheKey || cacheKey
    this._endpoint = `https://${this._host}/sdk/vimService`
    this._wsdl = `${this._endpoint}.wsdl`
    let soapEvents = this._options.soapEvents = this._options.soapEvents || {}

    if (this._options.ignoreSSL) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    this._connection = new Promise((resolve, reject) => {
      return soap.createClient(this._wsdl, this._options, (err, client) => {
        if (err) return reject(err)
        if (_.isFunction(soapEvents.request)) client.on('soap.request', soapEvents.request)
        if (_.isFunction(soapEvents.response)) client.on('soap.response', soapEvents.response)
        if (_.isFunction(soapEvents.error)) client.on('soap.error', soapEvents.error)
        if (_.isFunction(soapEvents.fault)) client.on('soap.fault', soapEvents.fault)

        this._soapClient = client
        this._VimPort = _.get(client, 'services.VimService.VimPort')

        // retrieve service content
        return this._VimPort.RetrieveServiceContent({
          _this: {
            type: 'ServiceInstance',
            value: 'ServiceInstance'
          }
        }, (err, result) => {
          if (err) return reject(err)
          this.serviceContent = _.get(result, 'returnval')
          this.apiVersion = _.get(this.serviceContent, 'about.apiVersion')
          this.typeResolver = typeResolver(this.apiVersion)
          _.forEach(methods, (fn, name) => { this[name] = fn.bind(this) })

          if (options.login !== false) {
            return this.login(this._options)
              .then(resolve)
              .catch(reject)
          }
          return resolve()
        })
      })
    })

    return new v(this)
  }
  setSecurity (securityObject) {
    this._soapClient.setSecurity(securityObject)
  }
}

// convenience method to create a new client
function client (host, options = {}) {
  return new VSphereClient(host, options)
}

// add cache functions to the main function
client.Cache = soap.Cache

export default client