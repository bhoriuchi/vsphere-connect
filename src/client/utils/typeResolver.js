/*
 * Resolves the vim type name without case sensetivity and adds friendly shortcuts
 * like vm for VirtualMachine host for HostSystem, etc.
 */
import _ from 'lodash'
import mo from './mo'

const ALIAS = {
  vm: 'VirtualMachine',
  host: 'HostSystem',
  store: 'Datastore',
  cluster: 'ClusterComputeResource'
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