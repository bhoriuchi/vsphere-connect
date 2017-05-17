/**
 * @module vsphere-connect
 * @description Build complex vSphere API requests
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 */
import _ from 'lodash'
import Errors from '../errors/index'
import EventEmitter from 'events'
import methods from './methods/index'
import soap from 'soap-connect'
import Utils from './utils/index'
import v from './v'
import { cacheKey, typeResolver } from './utils/index'

export class VSphereClient extends EventEmitter {
  constructor (host, options) {
    super()
    if (!host) throw new Error('No host specified')
    this._host = host
    this._options = _.isObject(options)
      ? options
      : {}
    this._options.cacheKey = this._options.cacheKey || cacheKey
    this._endpoint = `https://${this._host}/sdk/vimService`
    this._wsdl = `${this._endpoint}.wsdl`
    let soapEvents = _.isObject(this._options.soapEvents)
      ? this._options.soapEvents
      : {}

    if (this._options.ignoreSSL) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    this._connection = soap.createClient(this._wsdl, this._options)
      .then(client => {
        if (_.isFunction(soapEvents.request)) client.on('soap.request', soapEvents.request)
        if (_.isFunction(soapEvents.response)) client.on('soap.response', soapEvents.response)
        if (_.isFunction(soapEvents.error)) client.on('soap.error', soapEvents.error)
        if (_.isFunction(soapEvents.fault)) client.on('soap.fault', soapEvents.fault)

        this._soapClient = client
        this._VimPort = _.get(client, 'services.VimService.VimPort')

        return this._VimPort.RetrieveServiceContent({
          _this: {
            type: 'ServiceInstance',
            value: 'ServiceInstance'
          }
        })
      })
      .then(result => {
        this.serviceContent = _.get(result, 'returnval')
        this.apiVersion = _.get(this.serviceContent, 'about.apiVersion')
        this.typeResolver = typeResolver(this.apiVersion)
        _.forEach(methods, (fn, name) => { this[name] = fn.bind(this) })
        if (options.login !== false) return this.login(this._options)
      })

    return new v(this)
  }
  setSecurity (securityObject) {
    this._soapClient.setSecurity(securityObject)
  }
}

/**
 * Creates a new v instance
 * @param {String} host - vsphere host
 * @param {Object} options
 * @param {String|Function} options.cacheKey
 * @param {Boolean} [options.ignoreSSL=false]
 * @returns {v}
 */
function client (host, options) {
  return new VSphereClient(host, options)
}

// add utility functions
client.Cache = soap.Cache
client.Utils = Utils
client.Errors = Errors

export default client