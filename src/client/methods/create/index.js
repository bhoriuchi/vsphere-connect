import _ from 'lodash'
import createDatacenter from './datacenter'

export default function create (args = {}, options, callback) {
  if (_.isFunction(options)) {
    callback = options
    options = {}
  }
  callback = _.isFunction(callback) ? callback : () => false
  options = options || {}
  switch (this.typeResolver(args.type || _.get(args, 'moRef.type'))) {
    case 'Datacenter':
      return createDatacenter.call(this, args, options, callback)
    default:
      let err = new Error('invalid or no type specified during create')
      callback(err)
      return Promise.reject(err)
  }
}