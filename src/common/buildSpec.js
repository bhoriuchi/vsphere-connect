import _ from 'lodash'

/**
 * WORK IN PROGRESS
 */

const SpecDefinition = {}

SpecDefinition.VirtualMachine = {
  _this: 'ManagedObjectReference',
  config: 'VirtualMachineConfigSpec',
  pool: 'ManagedObjectReference'
}

export default function buildSpec (parent, type, build, options) {
  _.noop(parent, type, build, options)
}
