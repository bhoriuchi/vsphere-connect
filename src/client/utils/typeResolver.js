/*
 * Resolves the vim type name without case sensetivity and adds friendly shortcuts
 * like vm for VirtualMachine host for HostSystem, etc.
 */
import _ from 'lodash'
import mo from './mo'

const ALIAS = {
  cluster: 'ClusterComputeResource',
  dvswitch: 'DistributedVirtualSwitch',
  host: 'HostSystem',
  store: 'Datastore',
  storecluster: 'StoragePod',
  vm: 'VirtualMachine'
}

export default function typeResolver (apiVersion) {
  let typeMap = _.cloneDeep(ALIAS)
  _.forEach(mo[apiVersion], (v, k) => {
    typeMap[_.toLower(k)] = k
  })
  return function (type) {
    return _.get(typeMap, _.toLower(type))
  }
}