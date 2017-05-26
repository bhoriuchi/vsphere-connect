import _ from 'lodash'
import EventEmitter from 'events'
import soap from 'soap-connect'
import cacheKey from './common/cacheKey'
import typeResolver from './common/typeResolver'
import methods from './methods/index'
import v from './v'

class VsphereConnectClient extends EventEmitter {
  /**
   *
   * @param host {String} - viServer
   * @param [options] {Object} - connection options
   * @param [options.ignoreSSL=false] {Boolean} - ignores invalid ssl
   * @param [options.cacheKey] {Function} - cache key function whose return value will be used as the cache key name
   * @return {v}
   */
  constructor (host, options) {
    super()
    this.loggedIn = false

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
        return { connected: true }
      })

    return new v(this)
  }

  setSecurity (securityObject) {
    this._soapClient.setSecurity(securityObject)
  }

  destroy () {
    return methods.destroy.apply(this, [...arguments])
  }

  login () {
    return methods.login.apply(this, [...arguments])
  }

  logout () {
    return methods.logout.apply(this, [...arguments])
  }

  method () {
    return methods.method.apply(this, [...arguments])
  }

  reload () {
    return methods.reload.apply(this, [...arguments])
  }

  rename () {
    return methods.rename.apply(this, [...arguments])
  }

  retrieve () {
    return methods.retrieve.apply(this, [...arguments])
  }
}

export default function (host, options) {
  return new VsphereConnectClient(host, options)
}