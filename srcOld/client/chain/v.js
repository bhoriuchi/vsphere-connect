import Promise from 'bluebird'
import _ from 'lodash'

export default class v {
  constructor (client, state = {}) {
    this._client = client
    this._state = state
    this._chain = client._connection.then()
  }

  _resolveChain (handler) {
    this._chain = this._chain.then(result => {
      handler.call(this, result)
      return result
    })
    return this
  }

  type (name) {
    return this._resolveChain(result => {
      this._state.type = this.client.typeResolver(name)
    })
  }

  filter (arg) {
    return this._resolveChain(result => {
      if (_.isFunction(arg)) {

      } else if (_.isObject(arg)) {

      } else {

      }
    })
  }
}