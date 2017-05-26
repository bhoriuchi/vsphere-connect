import _ from 'lodash'
import v from './vee'
import Promise from 'bluebird'
import Debug from 'debug'
import { RETRIEVE } from './common/contants'

let debug = Debug('vconnect.rb')

export default class RequestBuilder {
  constructor (client, term) {
    this.client = client
    this.term = term || client._connection
    this.operation = null
    this._error = null
    this.args = {}
    this.options = {}
    this.resolved = false
    this.resolving = null
    this.single = false
    this._value = undefined
  }

  assignProps (rb, value) {
    rb.error = this.error
    rb.operation = this.operation
    rb.args = _.cloneDeep(this.args)
    rb.options = _.cloneDeep(this.options)
    rb.resolved = this.resolved
    rb.single = this.single
    rb._value = value
  }

  next (handler, isDefault) {
    let rb = new RequestBuilder(this.client)

    rb.term = this.term.then(value => {
      this.assignProps(rb, value)
      if (rb.error && !isDefault) return null
      if (isDefault) rb.error = null
      return _.isFunction(handler)
        ? handler(value, rb)
        : value
    })

    return new v(this.client, rb)
  }

  toResult (value) {
    return this.single && _.isArray(value)
      ? _.first(value)
      : value
  }

  get error () {
    return this._error
  }

  set error (err) {
    if (err === null || err instanceof Error) this._error = err
    else this._error = new Error(err)
  }

  get value () {
    if (this.resolved) return Promise.resolve(this._value)

    return this.next((value, rb) => {
      switch (rb.operation) {
        case RETRIEVE:
          debug('retrieving - %o', { args: this.args, options: this.options })
          rb.resolving = rb.client.retrieve(this.args, this.options)
            .then(result => {
              rb.resolved = true
              this.resolved = true
              this._value = rb.toResult(result)
              return this._value
            })
          break
        default:
          debug('using resolved value')
          rb.resolving = rb.toResult(value)
          break
      }
      return rb.resolving
    })
      ._rb
      .term
  }
}