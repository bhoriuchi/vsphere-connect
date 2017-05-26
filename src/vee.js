import _ from 'lodash'
import Promise from 'bluebird'
import RequestBuilder from './rb'
import ChangeFeed from './changefeed/index'
import { RETRIEVE } from './common/contants'

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

  return (
    condition instanceof v
      ? condition._rb.value
      : Promise.resolve(condition)
  )
    .then(c => {
      if (c === true) {
        return (
          val instanceof v
            ? val._rb.value
            : Promise.resolve(_.isFunction(val) ? val() : val)
        )
          .then(resolve, reject)
      } else if (args.length === 1) {
        return (
          las instanceof v
            ? las._rb.value
            : Promise.resolve(_.isFunction(las) ? las() : las)
        )
          .then(resolve, reject)
      } else {
        return processBranch(args, resolve, reject)
      }
    }, reject)
}

export default class v {
  constructor (client, rb) {
    this._rb = null

    let term = function (field) {
      return _.isString(field)
        ? term.value(field)
        : rb.next()
    }
    Object.setPrototypeOf(term, v.prototype)

    term._rb = rb instanceof RequestBuilder
      ? rb
      : new RequestBuilder(client)

    return term
  }

  /**
   * updates the request to return all fields
   * @return {*}
   */
  allData () {
    return this._rb.next((value, rb) => {
      rb.args.properties = []
      return value
    })
  }

  /**
   * performs a branch operation
   * @return {*}
   */
  branch () {
    let args = [...arguments]
    return this._rb.next((value, rb) => {
      args = args.length === 2
        ? _.union([value], args)
        : args

      if (args.length < 3 || args.length % 2 !== 1) {
        rb.error = 'branch has an invalid number of arguments'
        return
      }
      return new Promise((resolve, reject) => processBranch(args, resolve, reject))
        .then(result => {
          rb._value = result
          return result
        })
    })
  }

  /**
   * creates a new changefeed
   * @param options
   * @return {*}
   */
  changes (options) {
    return new ChangeFeed(this._rb.client, this._rb, options).create()
  }

  /**
   * Completes the connection process and returns the backend client
   * @return {*|Promise.<VsphereConnectClient>}
   */
  createClient () {
    return this._rb.client._connection
      .then(() => this._rb.client)
  }

  /**
   * default to a value if one does not exist
   * @param val
   * @return {*}
   */
  default (val) {
    return this._rb.next((value, rb) => {
      let error = rb.error
        ? rb.error
        : value === undefined
          ? new Error('NoResultsError: the selection has no results')
          : null
      rb.error = null

      return error
        ? _.isFunction(val)
          ? val(error)
          : val
        : value
    }, true)
  }

  /**
   * destroys a selection of objects
   * @param options
   * @return {*}
   */
  destroy (options) {
    return this._rb.next((value, rb) => {
      return Promise.map(rb.value, mo => {
        return rb.client.destroy(mo.moRef, options)
      })
    })
  }

  /**
   * performs a nested operation
   * @return {*}
   */
  do () {
    let args = [...arguments]
    let fn = _.last(args)
    if (!_.isFunction(fn)) throw new Error('invalid value for do')

    return this._rb.next((value, rb) => {
      let params = _.map(args.length > 1 ? args.slice(0, args.length - 1) : [value], param => {
        return param instanceof v ? param._rb.value : _.isFunction(param) ? param() : param
      })

      return Promise.map(params, param => param)
        .then(params => {
          return fn.apply(null, params)
        })
        .then(result => {
          rb.resolved = true
          rb._value = result
          return result
        })
    })
  }

  /**
   * iterates through a selection executing a handler function
   * @param iteratee
   */
  each (iteratee) {
    return this._rb.next((value, rb) => {
      if (this._rb.single) {
        rb.error = 'cannot call each on single selection'
        return
      }
      return Promise.each(this._rb.value, _.isFunction(iteratee) ? iteratee : _.identity)
    })
  }

  /**
   * converts a native value to a vConnect object
   * @param val
   */
  expr (val) {
    return this._rb.next((value, rb) => {
      rb.resolved = true
      return val
    })
  }

  /**
   * gets one or more managed objects by id
   */
  get () {
    let ids = [...arguments]
    return this._rb.next((value, rb) => {
      rb.args.id = ids
      rb.single = ids.length === 1
      return value
    })
  }

  /**
   * creates or sets a session
   * @param username
   * @param password
   */
  login (username, password) {
    return this._rb.next((value, rb) => {
      rb.operation = 'LOGIN'
      return rb.client.login(username, password)
    })
  }

  /**
   * logs the currently set session out
   */
  logout () {
    return this._rb.next((value, rb) => {
      rb.operation = 'LOGOUT'
      return rb.client.logout()
    })
  }

  /**
   * resolves the current command chain
   * @param onFulfilled
   * @param onRejected
   * @return {Promise.<TResult>}
   */
  then (onFulfilled, onRejected) {
    onFulfilled = _.isFunction(onFulfilled)
      ? onFulfilled
      : _.noop
    onRejected = _.isFunction(onRejected)
      ? onRejected
      : _.noop

    return this._rb.term.then(() => {
      if (this._rb.error) {
        onRejected(this._rb.error)
        return Promise.reject(this._rb.error)
      }
      return this._rb.value
    })
      .then(onFulfilled)
  }

  /**
   * sets the type for the current command chain
   * @param name
   */
  type (name) {
    return this._rb.next((value, rb) => {
      rb.args.type = rb.client.typeResolver(name)
      rb.args.properties = rb.args.properties || ['moRef', 'name']
      if (!rb.args.type) {
        rb.error = `InvalidTypeError: "${name}" is not a valid type or alias`
        return
      }
      rb.operation = RETRIEVE
      rb.single = false
      rb.resolved = false

      return value
    })
  }

  /**
   * gets the value at the specified path if provided otherwise returns the current value
   * @param attr
   */
  value (attr) {
    return this._rb.next((value, rb) => {
      return Promise.resolve(value)
        .then(value => {
          if (_.isString(attr)) {
            if (_.isArray(value)) return _.without(_.map(value, val => _.get(val, attr)), undefined)
            let val = _.get(value, attr)
            if (val === undefined) rb.error = `no attribute "${attr} in object"`
            return val
          }
          return value
        })
    })
  }
}