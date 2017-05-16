import _ from 'lodash'
import EventEmitter from 'events'
import soap from 'soap-connect'
import cacheKey from './common/cacheKey'
import typeResolver from './common/typeResolver'
import v from './v'

export default class Client extends EventEmitter {
  constructor (host, options) {
    super()

    if (!_.isString(host) || _.isEmpty(host)) throw new Error('missing required parameter "host"')
    options = _.isObject(object) && !_.isArray(options)
      ? options
      : {}

    options.cacheKey = _.isFunction(options.cacheKey)
      ? options.cacheKey
      : cacheKey

    if (options.ignoreSSL) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    let sdk = `https://${host}/sdk/vimService`
    let wsdl = `${sdk}.wsdl`

    let connection = soap.createClient(wsdl, options)
      .then(client => {
        this._soapClient = client
        this._vimPort = _.get(client, 'services.VimService.VimPort')

        return this._vimPort.RetrieveServiceContent({
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
        if (options.login !== false) return this.login(options)
      })

    return new v(this, connection)
  }
  setSecurity (securityObject) {
    this._soapClient.setSecurity(securityObject)
  }
}