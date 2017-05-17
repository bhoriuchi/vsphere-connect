import _ from 'lodash'
import Promise from 'bluebird'
import { OPERATIONS as ops } from './common/contants'
import buildPropList from './common/buildPropList'
import pluck from './common/pluck'

function assignRequest (target, source, obj = {}, term) {
  _.merge(target, _.omit(source, ['term']), obj)
  if (term == true) target.term = source.term
}

function processTerm (handler, obj = {}) {
  let req = {
    term: this._request.term.then(value => {
      assignRequest(req, this._request, obj)
      return handler(value, req)
    })
  }
  return new v(this._client, req)
}

export default class v {
  constructor (client, request) {
    this._client = client
    this._request = _.isObject(request)
      ? request
      : { term: client._connection }
  }

  /**
   * Completes the connection process and returns the backend client
   * @return {*|Promise.<VsphereConnectClient>}
   */
  createClient () {
    return this._client._connection.then(() => this._client)
  }

  limit (limit) {
    if (!_.isNumber(limit)) throw new Error('invalid value for limit')
    return processTerm.call(this, (value, req) => {
      _.set(req, 'options.limit', Math.ceil(limit))
      return value
    })
  }

  /**
   * Logs out of the current vSphere session
   * @return {*|Promise.<Object>}
   */
  logout () {
    return this._request.term.then(this._client.logout())
  }

  /**
   *
   * @param iteratee
   * @return {*}
   */
  map (iteratee) {
    iteratee = _.isFunction(iteratee) ? iteratee : _.identity
    return processTerm.call(this, (value, req) => {
      switch (req.operation) {
        case ops.RETRIEVE:
          req.operation = ops.MAP
          return Promise.map(this._client.retrieve(req.args, req.options), iteratee)
        default:
          return Promise.map(value, iteratee)
      }
    })
  }

  /**
   * Gets a specific record from a list of records
   * @param index
   */
  nth (index) {
    if (!_.isNumber(index)) throw new Error('invalid value for nth')
    return processTerm.call(this, (value, req) => {
      _.set(req, 'options.nth', Math.ceil(index))
      return value
    })
  }

  /**
   * Orders the results
   * @param doc
   * @return {*}
   */
  orderBy (doc) {
    return processTerm.call(this, (value, req) => {
      _.set(req, 'options.orderBy', doc)
      return value
    })
  }

  /**
   * Filters down the fields that will be returned
   * @return {v}
   */
  pluck () {
    let propList = buildPropList([...arguments])
    return processTerm.call(this, (value, req) => {
      let currentProps = _.get(req, 'args.properties', propList)
      let useProps = _.intersection(propList, currentProps)
      _.set(req, 'args.properties', useProps.length ? useProps : propList)
      return value
    })
  }

  /**
   * Sets the current type
   * @param name
   * @return {v}
   */
  type (name) {
    return processTerm.call(this, (value, req) => {
      let type = this._client.typeResolver(name)
      let operation = ops.RETRIEVE
      if (!type) throw Error(`invalid type ${name}`)
      assignRequest(req, this._request, { operation, type })
      _.set(req, 'args.type', type)
      return value
    })
  }

  /**
   * Performs the chain of operations
   * @param onFulfilled
   * @param onRejected
   * @return {*|Promise.<*>}
   */
  then (onFulfilled, onRejected) {
    onFulfilled = _.isFunction(onFulfilled)
      ? onFulfilled
      : _.noop
    onRejected = _.isFunction(onRejected)
      ? onRejected
      : _.noop

    return this._request.term.then(value => {
      switch (this._request.operation) {
        case ops.RETRIEVE:
          return this._client.retrieve(this._request.args, this._request.options)
            .then(onFulfilled, onRejected)

        default:
          return onFulfilled(value)
      }
      throw new Error(`UnknownOperation: ${this._request.operation}`)
    }, onRejected)
  }
}