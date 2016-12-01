import _ from 'lodash'
import EventEmitter from 'events'
import soap from 'soap-connect'
import methods from './methods/index'
import query from './query'
import { EVENTS_ENUM } from './const'

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
    let args = [...arguments]
    if (!this._type) throw new Error('a type must be selected first')
    if (!args.length) throw new Error('pluck requires one or more fields')
    this._chain.push({ method, prev: this._prev, args })
    this._prev = method
    return this
  }

  logout () {
    let method = 'logout'
    this._chain.push({ method, prev: this._prev })
    this._prev = method
    return this
  }

  session () {
    let method = 'session'
    this._chain.push({ method, prev: this._prev })
    this._prev = method
    return this
  }

  token (tkn) {
    let method = 'token'
    this._chain.push({ method, prev: this._prev, token: tkn })
    this._prev = method
    return this
  }

  retrieve (args) {
    let method = 'retrieve'
    this._chain.push({ method, prev: this._prev, args })
    this._prev = method
    return this
  }

  on (evt, handler) {
    if (!_.isString(evt) || !_.includes(EVENTS_ENUM, evt)) throw new Error(`invalid event "${evt}"`)
    if (!_.isFunction(handler)) throw new Error('on method requires a handler function')
    let method = 'on'
    this._chain.push({ method, prev: this._prev, evt, handler })
    this._prev = method
    return this
  }

  run () {
    return this._client._connection.then(() => {
      this._token = this._client._token
      this._session = this._client._session
      return query(this)
    })
  }
}

export class VSphereClient extends EventEmitter {
  constructor (host, options = {}) {
    super()
    if (!host) throw new Error('No host specified')
    this._host = host
    this._options = options
    this._endpoint = `https://${this._host}/sdk/vimService`
    this._wsdl = `${this._endpoint}.wsdl`

    if (this._options.ignoreSSL) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    this._connection = new Promise((resolve, reject) => {
      return soap.createClient(this._wsdl, this._options, (err, client) => {
        if (err) return reject(err)
        client.on('soap.request', (data) => { this.emit('request', data) })
        client.on('soap.response', (data) => { this.emit('response', data) })
        client.on('soap.error', (data) => { this.emit('error', data) })
        client.on('soap.fault', (data) => { this.emit('fault', data) })


        /*
        this.on('response', (data) => {
          console.log(data.body)
        })
        */

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
export default function (host, options = {}) {
  return new VSphereClient(host, options)
}