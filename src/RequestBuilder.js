import _ from 'lodash'
import Debug from 'debug'
import v from './v'
import { RETRIEVE } from './common/contants'

const debug = Debug('vconnect.rb')

export default class RequestBuilder {
  constructor (client, parent) {
    this.client = client
    this.parent = parent
    this.term = client._connection
    this.operation = null
    this.error = null
    this.args = {}
    this.options = {}
    this.single = false
    this._value = undefined
    this.allData = false
  }

  reset () {
    this.operation = null
    this.error = null
    this.args = {}
    this.options = {}
    this.single = false
    this._value = undefined
    this.allData = false
  }

  assignProps (rb) {
    rb.error = this.error
    rb.operation = this.operation
    rb.args = _.cloneDeep(this.args)
    rb.options = _.cloneDeep(this.options)
    rb.single = this.single
  }

  toResult (value) {
    return this.single && _.isArray(value)
      ? _.first(value)
      : value
  }

  next (handler, isDefault) {
    const rb = new RequestBuilder(this.client, this)

    rb.term = this.term.then(value => {
      this._value = value
      this.assignProps(rb)
      if (rb.error && !isDefault) return null
      if (isDefault) rb.error = null
      return _.isFunction(handler)
        ? handler(value, rb)
        : value
    })

    return new v(this.client, rb)
  }

  get value () {
    return this.term.then(value => {
      switch (this.operation) {
        case RETRIEVE:
          debug('retrieving - %o', { args: this.args, options: this.options })
          if (this.allData) this.args.properties = []
          if (!this.args.properties) this.args.properties = [ 'moRef', 'name' ]
          return this.client.retrieve(this.args, this.options)
            .then(result => {
              this.operation = null
              this._value = this.toResult(result)
              return this._value
            })
        default:
          break
      }
      this._value = this.toResult(value)
      return this._value
    })
  }
}
