import _ from 'lodash'
import Promise from 'bluebird'
import ChangeFeed from './changefeed/index'
import { OPERATIONS as ops } from './common/contants'
import buildPropList from './common/buildPropList'
import pluck from './common/pluck'

/**
 * returns a new request context built from the existing
 * @param target
 * @param source
 * @param obj
 * @param term
 */
function assignRequest (target, source, obj = {}, term) {
  _.merge(target, _.omit(source, ['term']), obj)
  if (term == true) target.term = source.term
}

/**
 * processes the current term promise and updates the context
 * @param handler
 * @param obj
 * @return {v}
 */
function processTerm (handler, obj = {}) {
  let req = {
    term: this._request.term.then(value => {
      assignRequest(req, this._request, obj)
      return handler(value, req)
    })
  }
  return new v(this._client, req)
}

/**
 * recursively processes the branch statements
 * @param args
 * @param resolve
 * @param reject
 * @return {*|Promise.<*>|Promise.<TResult>}
 */
function processBranch (args, resolve, reject) {
  let condition = args.shift()
  let val = args.shift()
  let las = _.last(args)

  return Promise.resolve(condition)
    .then(c => {
      if (c === true) {
        return Promise.resolve(_.isFunction(val) ? val() : val)
          .then(resolve, reject)
      } else if (args.length === 1) {
        return Promise.resolve(_.isFunction(las) ? las() : las)
          .then(resolve, reject)
      } else {
        return processBranch(args, resolve, reject)
      }
    }, reject)
}

/**
 * retrieves records and clears out the request context
 * @param req
 * @return {*|Promise.<*>}
 */
function performRetrieve (req) {
  return this._client.retrieve(req.args, req.options)
    .then(result => {
      req.args = {}
      req.options = {}
      return result
    })
}

export default class v {
  constructor (client, request) {
    this._client = client
    this._request = _.isObject(request)
      ? request
      : {}
    this._request.term = this._request.term || client._connection
  }

  /**
   * updates the request to return all fields
   * @return {*}
   */
  allData () {
    return processTerm.call(this, (value, req) => {
      _.set(req, 'args.properties', [])
      return value
    })
  }

  /**
   * performs a branch operation
   * @return {*}
   */
  branch () {
    let args = [...arguments]
    return processTerm.call(this, (value, req) => {
      req.operation = null
      args = args.length === 2
        ? _.union([value], args)
        : args

      if (args.length < 3 || args.length % 2 !== 1) throw new Error('branch has an invalid number of arguments')
      return new Promise((resolve, reject) => processBranch(args, resolve, reject))
    })
  }

  /**
   * creates a new changefeed
   * @param options
   * @return {*}
   */
  changes (options) {
    return this._request.term.then(() => {
      return new ChangeFeed(this._client, this._request, options).create()
    })
  }

  /**
   * Completes the connection process and returns the backend client
   * @return {*|Promise.<VsphereConnectClient>}
   */
  createClient () {
    return this._client._connection.then(() => this._client)
  }

  /**
   * performs a nested operation
   * @return {*}
   */
  do () {
    let args = [...arguments]
    let fn = _.last(args)
    if (!_.isFunction(fn)) throw new Error('invalid value for do')
    return processTerm.call(this, (value, req) => {
      let params = args.length > 1
        ? args.slice(0, args.length - 1)
        : [value]
      return Promise.map(params, param => param)
        .then(params => {
          req.operation = ops.DO
          return fn.apply(null, params)
        })
    })
  }

  /**
   * loops through a collection and performs the iteratee function
   * @param iteratee
   * @return {*}
   */
  each (iteratee) {
    iteratee = _.isFunction(iteratee) ? iteratee : _.identity
    return processTerm.call(this, (value, req) => {
      let data = value
      switch (req.operation) {
        case ops.RETRIEVE:
          data = performRetrieve.call(this, req)
          break
        default:
          break
      }
      return Promise.each(data, iteratee)
        .then(result => {
          req.operation = ops.EACH
          return result
        })
    })
  }

  /**
   * compares passed value to current value
   * @param val
   * @return {*}
   */
  eq (val) {
    return processTerm.call(this, (value, req) => {
      let data = value
      switch (req.operation) {
        case ops.RETRIEVE:
          data = performRetrieve.call(this, req)
          break
        default:
          break
      }
      return Promise.all([val, data])
        .then(result => {
          req.operation = ops.EQ
          return _.isEqual(result[0], result[1])
        })
    })
  }

  /**
   * creates a new expression
   * @param val
   * @return {*}
   */
  expr (val) {
    return processTerm.call(this, (value, req) => {
      req.operation = ops.EXPR
      return val
    })
  }

  /**
   * Filters a collection
   * @param iteratee
   * @param options
   * @return {*}
   */
  filter (iteratee, options) {
    iteratee = _.isFunction(iteratee) ? iteratee : _.identity
    return processTerm.call(this, (value, req) => {
      let data = value
      switch (req.operation) {
        case ops.RETRIEVE:
          data = performRetrieve.call(this, req)
          break
        default:
          break
      }
      return Promise.filter(data, iteratee, options)
        .then(result => {
          req.operation = ops.FILTER
          return result
        })
    })
  }

  /**
   * gets one or more objects by id
   * @param id
   * @return {*}
   */
  get () {
    let ids = [...arguments]
    return processTerm.call(this, (value, req) => {
      _.set(req, 'args.id', ids)
      return performRetrieve.call(this, req)
        .then(result => {
          req.operation = ops.GET
          return ids.length > 1
            ? result
            :_.get(result, '[0]', null)
        })
    })
  }

  /**
   * returns the id value from the current selection
   * @return {*}
   */
  id () {
    return processTerm.call(this, (value, req) => {
      req.operation = null
      return _.isArray(value)
        ? _.map(value, v => _.get(v, 'moRef.value', null))
        : _.get(value, 'moRef.value', null)
    })
  }

  /**
   * Limits the number of records returned
   * @param limit
   * @return {*}
   */
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
   * performs a map operation
   * @param iteratee
   * @return {*}
   */
  map (iteratee, options) {
    iteratee = _.isFunction(iteratee) ? iteratee : _.identity
    return processTerm.call(this, (value, req) => {
      let data = value
      switch (req.operation) {
        case ops.RETRIEVE:
          data = performRetrieve.call(this, req)
          break
        default:
          break
      }
      return Promise.map(data, iteratee, options)
        .then(result => {
          req.operation = ops.MAP
          return result
        })
    })
  }

  /**
   * interact directly with the vsphere api
   * @param name
   * @param args
   * @return {*}
   */
  method (name, args) {
    return processTerm.call(this, (value, req) => {
      return this._client.method(name, args)
        .then(result => {
          req.operation = null
          return result
        })
    })
  }

  /**
   * compares passed value to current value
   * @param val
   * @return {*}
   */
  ne (val) {
    return processTerm.call(this, (value, req) => {
      let data = value
      switch (req.operation) {
        case ops.RETRIEVE:
          data = performRetrieve.call(this, req)
          break
        default:
          break
      }
      return Promise.map([val, data])
        .then(result => {
          req.operation = ops.NE
          return !_.isEqual(result[0], result[1])
        })
    })
  }

  /**
   * does a not operation on the current value
   * @return {*}
   */
  not () {
    return processTerm.call(this, (value, req) => {
      req.operation = ops.NOT
      return !_.includes([true, 1, "true", "TRUE"], value)
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
      useProps = useProps.length ? useProps : propList

      switch (req.operation) {
        case ops.RETRIEVE:
          _.set(req, 'args.properties', useProps)
          return value
        default:
          return pluck(value, useProps)
      }
    })
  }

  /**
   * call the clients retrieve method directly
   * @param args
   * @param options
   * @return {*}
   */
  retrieve (args, options) {
    return processTerm.call(this, (value, req) => {
      return this._client.retrieve(args, options)
        .then(result => {
          req.operation = null
          return result
        })
    })
  }

  /**
   * selects a value from the current result
   * @param p
   * @return {*}
   */
  value (p) {
    return processTerm.call(this, (value, req) => {
      let data = Promise.resolve(value)
      switch (req.operation) {
        case ops.RETRIEVE:
          data = performRetrieve.call(this, req)
          break
        default:
          break
      }
      return data.then(result => {
        req.operation = null
        return _.isString(p)
          ? _.get(result, p, null)
          : result
      })
    })
  }

  /**
   * performs a reduce operation
   * @param iteratee
   * @param initialValue
   * @return {*}
   */
  reduce (iteratee, initialValue) {
    iteratee = _.isFunction(iteratee) ? iteratee : _.identity
    return processTerm.call(this, (value, req) => {
      let data = value
      switch (req.operation) {
        case ops.RETRIEVE:
          data = performRetrieve.call(this, req)
          break
        default:
          break
      }
      return Promise.reduce(data, iteratee, initialValue)
        .then(result => {
          req.operation = ops.REDUCE
          return result
        })
    })
  }

  /**
   * Limits the number of records returned
   * @param count
   * @return {*}
   */
  skip (count) {
    if (!_.isNumber(count)) throw new Error('invalid value for skip')
    return processTerm.call(this, (value, req) => {
      _.set(req, 'options.skip', Math.ceil(skip))
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
      _.set(req, 'args.properties', ['moRef', 'name'])
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
      throw new Error(`UnsupportedOperation: ${this._request.operation}`)
    }, onRejected)
  }
}