import _ from 'lodash'
import EventEmitter from 'events'
import soap from 'soap-connect'
import methods from './methods/index'
import { cacheKey, typeResolver } from '../utils/index'

export default class chain extends EventEmitter {
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

    if (this._options.ignoreSSL) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    this._connection = soap.createClient(this._wsdl, this._options)
      .then(client => {
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