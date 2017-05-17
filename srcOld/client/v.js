import _ from 'lodash'
import query from './query/index'

/**
 * Top level vsphere-connect namespace, used to build a request chain
 * @example
 * import VSphere from 'vsphere-connect'
 *
 * let v = VSphere('vsphere.mydomain.com', {
 *   username: 'root',
 *   password: 'password',
 *   ignoreSSL: true
 * })
 *
 * v.type('cluster')
 *   .pluck('name')
 *   .run()
 *   .then(clusters => {
 *     console.log(clusters)
 *     return v.logout().run()
 *   })
 */
export default class v {
  constructor (client, value = null, chain = [], prev = null, type = null) {
    this._client = client
    this._chain = chain
    this._prev = prev
    this._type = type
  }

  /**
   * Resolves a vSphere Connect client instance
   * @returns {Promise.<VSphereConnectClient>}
   */
  client () {
    return this._client._connection.then(() => this._client)
  }

  /**
   * Creates a new datacenter
   * @param {String} name - datacenter name
   * @returns {v}
   */
  createDatacenter (name) {
    if (!_.isString(name)) throw new Error('no name specified')
    let method = 'createDatacenter'
    this._chain.push({ method, prev: this._prev, name })
    this._prev = method
    return this
  }

  /**
   * Selects a folder
   * @param {String} id - folder id
   * @returns {v}
   */
  folder (id) {
    if (!_.isString(id)) throw new Error('no id specified')
    let method = 'folder'
    this._chain.push({ method, prev: this._prev, id })
    this._prev = method
    return this
  }

  /**
   * Get the current selected type by id. A call to the type method must precede a call to this method
   * @param {String} id - type id
   * @returns {v}
   */
  get (id) {
    if (!_.isString(id)) throw new Error('no id specified')
    let method = 'get'
    this._chain.push({ method, prev: this._prev, id })
    this._prev = method
    return this
  }

  /**
   * Get all objects of the current selected type. A call to the type method must precede a call to this method
   * @returns {v}
   */
  getAll () {
    let method = 'getAll'
    this._chain.push({ method, prev: this._prev })
    this._prev = method
    return this
  }

  /**
   * Limit the number of results returned
   * @param {Number} count - The maximum number of results to return
   * @returns {v}
   */
  limit (count) {
    if (!_.isNumber(count)) throw new Error('limit must be an integer')
    let method = 'limit'
    this._chain.push({ method, prev: this._prev, limit: Math.floor(count) })
    this._prev = method
    return this
  }

  /**
   * Log out of the current session
   * @returns {v}
   */
  logout () {
    let method = 'logout'
    this._chain.push({ method, prev: this._prev })
    this._prev = method
    return this
  }

  /**
   * Select a specific result by index
   * @param {Number} index - Result to select
   * @returns {v}
   */
  nth (index) {
    if (!_.isNumber(index)) throw new Error('nth selection must be an integer')
    let method = 'nth'
    this._chain.push({ method, prev: this._prev, nth: Math.floor(index) })
    this._prev = method
    return this
  }

  /**
   * Select results starting at a specific index
   * @param {Number} index - Index to start selection from
   * @returns {v}
   */
  offset (index) {
    if (!_.isNumber(index)) throw new Error('offset must be an integer')
    let method = 'offset'
    this._chain.push({ method, prev: this._prev, offset: Math.floor(index) })
    this._prev = method
    return this
  }

  /**
   * Plucks out one or more attributes from the result set
   * @param {...String} property
   * @returns {v}
   */
  pluck () {
    let method = 'pluck'
    let args = [...arguments]
    if (!this._type) throw new Error('a type must be selected first')
    if (!args.length) throw new Error('pluck requires one or more fields')
    this._chain.push({ method, prev: this._prev, args })
    this._prev = method
    return this
  }

  /**
   * Retrieves results based on the query document
   * @param {QueryDocument} queryDocument
   * @returns {v}
   */
  retrieve (queryDocument) {
    let method = 'retrieve'
    this._chain.push({ method, prev: this._prev, args: queryDocument })
    this._prev = method
    return this
  }

  /**
   * Runs the current request chain
   * @returns {Promise.<*>}
   */
  run () {
    return this._client._connection.then(() => {
      this._token = this._client._token
      this._session = this._client._session
      return query(this)
    })
  }

  /**
   * Gets the current session object
   * @returns {v}
   */
  session () {
    let method = 'session'
    this._chain.push({ method, prev: this._prev })
    this._prev = method
    return this
  }

  /**
   * Gets the current session token
   * @returns {v}
   */
  /**
   * Sets the current session token
   * @param {String} token
   * @returns {v}
   */
  token (token) {
    let method = 'token'
    this._chain.push({ method, prev: this._prev, token })
    this._prev = method
    return this
  }

  /**
   * Sets the managed object type in the current request chain
   * @param name
   * @returns {v}
   */
  type (name) {
    if (!name) throw new Error('type method requires a type name')
    return new v(this._client, null, [], null, name)
  }
}