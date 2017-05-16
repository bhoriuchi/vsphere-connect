import _ from 'lodash'
import Promise from 'bluebird'
import { InvalidMethodError } from '../../errors/index'

export default function method (name, args) {
  args = _.isObject(args) ? args : {}
  let _method = _.get(this._VimPort, `["${name}"]`)

  return _.isFunction(_method)
    ? _method(args).then(result => _.get(result, 'returnval', result))
    : Promise.reject(new InvalidMethodError(name))
}