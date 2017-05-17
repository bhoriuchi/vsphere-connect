import _ from 'lodash'
import Promise from 'bluebird'
import createCluster from './cluster'
import createDatacenter from './datacenter'
import createDVSwitch from './dvswitch'
import createFolder from './folder'
import createStoreCluster from './storecluster'
import createVM from './vm'

export default function create (args, options) {
  let type = _.get(args, 'type') || _.get(args, 'moRef.type')

  switch (this.typeResolver(type)) {
    case 'ClusterComputeResource':
      return createCluster.call(this, args, options)

    case 'Datacenter':
      return createDatacenter.call(this, args, options)

    case 'DistributedVirtualSwitch':
      return createDVSwitch.call(this, args, options)

    case 'Folder':
      return createFolder.call(this, args, options)

    case 'StoragePod':
      return createStoreCluster.call(this, args, options)

    case 'VirtualMachine':
      return createVM.call(this, args, options)

    default:
      return Promise.reject(new Error(`invalid type "${type}" specified during create`))
  }
}