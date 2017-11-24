import _ from 'lodash'
import Promise from 'bluebird'
import { InvalidMethodError } from '../errors/index'

export default function method (name, args) {
  const _args = _.isObject(args) ? args : {}
  const _method = _.get(this._VimPort, `["${name}"]`)

  return _.isFunction(_method)
    ? _method(_args).then(result => _.get(result, 'returnval', result))
    : Promise.reject(new InvalidMethodError(name))
}
