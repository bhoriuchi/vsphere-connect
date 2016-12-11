import _ from 'lodash'
import Promise from 'bluebird'
import query from './query/index'

export default class v {
  constructor (client, value = null, chain = [], prev = null, type = null) {
    this._client = client
    this._chain = chain
    this._prev = prev
    this._type = type
  }

  // allow direct access to the client
  client (callback = () => false) {
    return this._client._connection
      .then(() => {
        callback(null, this._client)
        return this._client
      })
      .catch((err) => {
        callback(err)
        return Promise.reject(err)
      })
  }

  get (id) {
    if (!_.isString(id)) throw new Error('no id specified')
    let method = 'get'
    this._chain.push({ method, prev: this._prev, id })
    this._prev = method
    return this
  }

  getAll () {
    let method = 'getAll'
    this._chain.push({ method, prev: this._prev })
    this._prev = method
    return this
  }

  limit (val) {
    if (!_.isNumber(val)) throw new Error('limit must be an integer')
    let method = 'limit'
    this._chain.push({ method, prev: this._prev, limit: parseInt(val) })
    this._prev = method
    return this
  }

  logout () {
    let method = 'logout'
    this._chain.push({ method, prev: this._prev })
    this._prev = method
    return this
  }

  nth (idx, def) {
    if (!_.isNumber(idx)) throw new Error('nth selection must be an integer')
    let method = 'nth'
    this._chain.push({ method, prev: this._prev, nth: parseInt(idx), default: def })
    this._prev = method
    return this
  }

  offset (val) {
    if (!_.isNumber(val)) throw new Error('offset must be an integer')
    let method = 'offset'
    this._chain.push({ method, prev: this._prev, offset: parseInt(val) })
    this._prev = method
    return this
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

  retrieve (args) {
    let method = 'retrieve'
    this._chain.push({ method, prev: this._prev, args })
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

  type (name) {
    if (!name) throw new Error('type method requires a type name')
    return new v(this._client, null, [], null, name)
  }
}