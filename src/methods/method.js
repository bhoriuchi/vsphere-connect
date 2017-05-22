import _ from 'lodash'
import Promise from 'bluebird'
import { InvalidMethodError } from '../errors/index'

export default function method (name, args) {
  args = _.isObject(args) ? args : {}
  let method = _.get(this._VimPort, `["${name}"]`)

  return _.isFunction(method)
    ? method(args).then(result => _.get(result, 'returnval', result))
    : Promise.reject(new InvalidMethodError(name))
}