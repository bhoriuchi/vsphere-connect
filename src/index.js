import _ from 'lodash'
import EventEmitter from 'events'
import soap from 'soap-connect'
import cacheKey from './common/cacheKey'
import typeResolver from './common/typeResolver'
import methods from './methods/index'
import v from './v'

class VsphereConnectClient extends EventEmitter {
  constructor (host, options) {
    super()

    if (!_.isString(host) || _.isEmpty(host)) throw new Error('missing required parameter "host"')

    options = _.isObject(options) && !_.isArray(options)
      ? options
      : {}

    options.cacheKey = _.isFunction(options.cacheKey)
      ? options.cacheKey
      : cacheKey

    if (options.ignoreSSL) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    this._connection = soap.createClient(`https://${host}/sdk/vimService.wsdl`, options)
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
        // _.forEach(methods, (fn, name) => { this[name] = fn.bind(this) })
        return options.login !== false
          ? this.login(options)
          : {}
      })

    return new v(this)
  }

  setSecurity (securityObject) {
    this._soapClient.setSecurity(securityObject)
  }

  login (args) {
    return methods.login.call(this, args)
  }

  logout () {
    return methods.logout.call(this)
  }

  method (name, args) {
    return methods.method.call(this, name, args)
  }

  retrieve (args, options) {
    return methods.retrieve.call(this, args, options)
  }
}

export default function (host, options) {
  return new VsphereConnectClient(host, options)
}