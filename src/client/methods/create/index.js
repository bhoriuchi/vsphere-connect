import _ from 'lodash'
import Promise from 'bluebird'
import createCluster from './cluster'
import createDatacenter from './datacenter'
import createDVSwitch from './dvswitch'
import createFolder from './folder'
import createStoreCluster from './storecluster'
import createVM from './vm'

export default function create (args = {}, options, callback) {
  if (_.isFunction(options)) {
    callback = options
    options = {}
  }
  callback = _.isFunction(callback) ? callback : () => false
  options = options || {}
  let type = args.type || _.get(args, 'moRef.type')
  switch (this.typeResolver(type)) {
    case 'ClusterComputeResource':
      return createCluster.call(this, args, options, callback)
    case 'Datacenter':
      return createDatacenter.call(this, args, options, callback)
    case 'DistributedVirtualSwitch':
      return createDVSwitch.call(this, args, options, callback)
    case 'Folder':
      return createFolder.call(this, args, options, callback)
    case 'StoragePod':
      return createStoreCluster.call(this, args, options, callback)
    case 'VirtualMachine':
      return createVM.call(this, args, options, callback)
    default:
      let err = new Error(`invalid type "${type}" specified during create`)
      callback(err)
      return Promise.reject(err)
  }
}