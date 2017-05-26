import _ from 'lodash'
import Promise from 'bluebird'
import RequestBuilder from './RequestBuilder'
import ChangeFeed from './changefeed/index'
import orderDoc from './common/orderDoc'
import pluck from './common/pluck'
import buildPropList from './common/buildPropList'
import { RETRIEVE } from './common/contants'

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
      return term.value(field)
    }
    Object.setPrototypeOf(term, v.prototype)

    term._rb = rb instanceof RequestBuilder
      ? rb
      : new RequestBuilder(client)

    return term
  }

  /**
   * returns add data from the current type
   */
  allData () {
    return this._rb.next((value, rb) => {
      rb.args.properties = []
      rb.allData = true
      return value
    })
  }

  /**
   * performs an if then else
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
    })
  }

  /**
   * creates a new changefeed and returns an observable
   * @param options
   * @returns {*}
   */
  changes (options) {
    return new ChangeFeed(this._rb.client, this._rb, options).create()
  }

  /**
   * returns the backend client
   * @returns {*}
   */
  createClient () {
    return this._rb.client._connection
      .then(() => this._rb.client)
  }

  /**
   * sets a default value if there is an error and clears the error
   * @param val
   */
  default (val) {
    return this._rb.next((value, rb) => {
      return this._rb.value.then(value => {
        rb.operation = 'DEFAULT'
        let error = this._rb.error
          ? this._rb.error
          : value === undefined
            ? new Error('NoResultsError: the selection has no results')
            : null
        this._rb.error = null
        rb.error = null

        return error
          ? _.isFunction(val)
            ? val(error)
            : val
          : value
      })
    }, true)
  }

  /**
   * destroys all of the vms in the selection
   * @param options
   */
  destroy (options) {
    return this._rb.next(() => {
      return this._rb.value.then(value => {
        this.operation = 'DESTROY'
        return Promise.map(_.castArray(value), mo => {
          return this._rb.client.destroy(mo.moRef, options)
        })
      })
    })
  }

  /**
   * performs one or more operations and feeds them into a handler function
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
    })
  }

  /**
   * iterates over a set of values and executes an iteratee function on their values
   * @param iteratee
   */
  each (iteratee) {
    return this._rb.next((value, rb) => {
      return this._rb.value.then(value => {
        rb.operation = 'EACH'
        if (!_.isArray(value)) {
          rb.error = 'cannot call each on single selection'
          return null
        }
        return Promise.each(value, _.isFunction(iteratee) ? iteratee : _.identity)
      })
    })
  }

  /**
   * determines if one or more values equal the current selection
   */
  eq () {
    let args = [...arguments]
    if (!args.length) throw new Error('eq requires at least one argument')
    return this._rb.next((value, rb) => {
      return this._rb.value.then(value => {
        rb.operation = 'EQ'
        return Promise.reduce([...arguments], (accum, item) => {
          return accum && _.isEqual(value, item)
        }, true)
      })
    })
  }

  /**
   * converts a native value into a vConnect object
   * @param val
   */
  expr (val) {
    if (val === undefined) throw new Error('cannot wrap undefined with expr')
    return this._rb.next((value, rb) => {
      rb.operation = 'EXPR'
      rb.single = !_.isArray(val)
      return val
    })
  }

  /**
   * filters out all values that do not return true from the filterer function
   * @param filterer
   * @param options
   */
  filter (filterer, options) {
    return this._rb.next((value, rb) => {
      return this._rb.value.then(value => {
        rb.operation = 'FILTER'
        if (!_.isArray(value)) {
          rb.error = 'cannot call filter on single selection'
          return null
        }
        return Promise.filter(value, _.isFunction(filterer) ? filterer : _.identity, options)
      })
    })
  }

  /**
   * gets one or more managed objects by id
   */
  get () {
    let ids = [...arguments]
    return this._rb.next((value, rb) => {
      if (rb.operation === RETRIEVE) {
        rb.args.id = ids
        rb.single = ids.length === 1
        return value
      }
      if (!_.isArray(value)) {
        rb.error = new Error('cannot get from non-array')
        return null
      }
      return _.filter(value, mo => {
        let { type, value } = _.get(mo, 'moRef', {})
        return _.get(rb.args, 'type') === type && _.includes(ids, value)
      })
    })
  }

  /**
   * gets the id from the current selection or object
   * @returns {*}
   */
  id () {
    return this._rb.next((value, rb) => {
      return this._rb.value.then(value => {
        rb.operation = 'ID'
        return _.isArray(value)
          ? _.map(value, v => _.get(v, 'moRef.value', null))
          : _.get(value, 'moRef.value', null)
      })
    })
  }

  /**
   * limits the number of results
   * @param limit
   * @returns {*}
   */
  limit (limit) {
    if (!_.isNumber(limit)) throw new Error('invalid value for limit')
    return this._rb.next((value, rb) => {
      if (rb.single) {
        rb.error = new Error('cannot limit single selection')
        return null
      }
      if (rb.operation === RETRIEVE) {
        rb.options.limit = Math.ceil(limit)
        return value
      }
      if (!_.isArray(value)) {
        rb.error = new Error('cannot limit non-array')
        return null
      }
      return _.first(value)
    })
  }

  /**
   * creates a new session or sets the token for the current instance
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
   * logs out the current session
   */
  logout () {
    return this._rb.next((value, rb) => {
      rb.operation = 'LOGOUT'
      return rb.client.logout()
    })
  }

  /**
   * maps a selection
   * @param mapper
   * @param options
   */
  map (mapper, options) {
    return this._rb.next((value, rb) => {
      return this._rb.value.then(value => {
        rb.operation = 'MAP'
        if (!_.isArray(value)) {
          rb.error = 'cannot call map on single selection'
          return null
        }
        return Promise.map(value, _.isFunction(mapper) ? mapper : _.identity, options)
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
    return this._rb.next((value, rb) => {
      rb.operation = 'METHOD'
      rb._value = undefined
      return rb.client.method(name, args)
    })
  }

  /**
   * determines if one or more values equal the current selection
   */
  ne () {
    let args = [...arguments]
    if (!args.length) throw new Error('ne requires at least one argument')
    return this._rb.next((value, rb) => {
      return this._rb.value.then(value => {
        rb.operation = 'NE'
        return Promise.reduce([...arguments], (accum, item) => {
          return accum && !_.isEqual(value, item)
        }, true)
      })
    })
  }

  /**
   * does a not operation on the current value
   * @return {*}
   */
  not () {
    return this._rb.next((value, rb) => {
      return this._rb.value.then(value => {
        rb.operation = 'NOT'
        if (value === undefined) {
          rb.error = new Error('cannot not an undefined value')
          return null
        }
        return _.includes([false, null], value)
      })
    })
  }

  /**
   * Gets a specific record from a list of records
   * @param index
   */
  nth (n) {
    if (!_.isNumber(index)) throw new Error('invalid value for nth')
    return this._rb.next((value, rb) => {
      if (rb.single) {
        rb.error = new Error('cannot get nth on single selection')
        return null
      }
      if (rb.operation === RETRIEVE) {
        rb.single = true
        rb.options.nth = Math.ceil(n)
        return value
      }
      if (!_.isArray(value)) {
        rb.error = new Error('cannot get nth on non-array')
        return null
      }
      rb.single = true
      return _.nth(value, n)
    })
  }

  /**
   * Orders the results
   * @param doc
   * @return {*}
   */
  orderBy (doc) {
    return this._rb.next((value, rb) => {
      if (rb.single) {
        rb.error = new Error('cannot order single selection')
        return null
      }
      if (rb.operation === RETRIEVE) {
        rb.options.orderBy = doc
        return value
      }
      if (!_.isArray(value)) {
        rb.error = new Error('cannot order non-array')
        return null
      }
      let { fields, directions } = orderDoc(doc)
      return _.orderBy(value, fields, directions)
    })
  }

  /**
   * Filters down the fields that will be returned
   * @return {v}
   */
  pluck () {
    return this._rb.next((value, rb) => {
      rb.allData = false
      let propList = buildPropList([...arguments])
      let currentProps = _.get(rb.args, 'properties', propList)
      let useProps = _.intersection(propList, currentProps)
      useProps = useProps.length ? useProps : propList

      if (rb.operation === RETRIEVE) {
        rb.args.properties = useProps
        return value
      }
      return pluck(value, useProps)
    })
  }

  reduce (reducer, initialValue) {
    return this._rb.next((value, rb) => {
      return this._rb.value.then(value => {
        rb.operation = 'REDUCE'
        if (!_.isArray(value)) {
          rb.error = 'cannot call reduce on single selection'
          return null
        }
        return Promise.reduce(value, _.isFunction(reducer) ? reducer : _.identity, initialValue)
      })
    })
  }

  /**
   * call the clients retrieve method directly
   * @param args
   * @param options
   * @return {*}
   */
  retrieve (args, options) {
    return this._rb.next((value, rb) => {
      rb.operation = 'RETRIEVE'
      rb._value = undefined
      return rb.client.retrieve(args, options)
    })
  }

  /**
   * limits the number of results
   * @param limit
   * @returns {*}
   */
  skip (n) {
    if (!_.isNumber(n) || n < 1) throw new Error('invalid value for skip')
    return this._rb.next((value, rb) => {
      if (rb.single) {
        rb.error = new Error('cannot skip single selection')
        return null
      }
      if (rb.operation === RETRIEVE) {
        rb.options.skip = Math.ceil(n)
        return value
      }
      if (!_.isArray(value)) {
        rb.error = new Error('cannot skip non-array')
        return null
      }
      return _.slice(value, Math.ceil(n))
    })
  }


  /**
   * sets the managed object type of the current request chain
   * @param name
   */
  type (name) {
    return this._rb.next((value, rb) => {
      rb.args.type = rb.client.typeResolver(name)
      // rb.args.properties = rb.args.properties || ['moRef', 'name']
      if (!rb.args.type) {
        rb.error = `InvalidTypeError: "${name}" is not a valid type or alias`
        return null
      }
      rb._value = undefined
      rb.operation = RETRIEVE
      rb.single = false

      return null
    })
  }

  /**
   * resolves the current request chain
   * @param onFulfilled
   * @param onRejected
   * @returns {Promise.<TResult>}
   */
  then (onFulfilled, onRejected) {
    onFulfilled = _.isFunction(onFulfilled)
      ? onFulfilled
      : _.noop
    onRejected = _.isFunction(onRejected)
      ? onRejected
      : _.noop

    return this._rb.value.then(result => {
      this.operation = null
      return this._rb.error
        ? Promise.reject(this._rb.error)
        : result
    })
      .then(onFulfilled, onRejected)
  }

  /**
   * selects a specific value of the current selection
   * or object if attr is supplied or the current value if no arguments
   * @param attr
   */
  value (attr) {
    return this._rb.next((value, rb) => {
      return this._rb.value.then(value => {
        rb.operation = 'VALUE'
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