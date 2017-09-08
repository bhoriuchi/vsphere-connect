import _ from 'lodash'
import BaseBuilder from './BaseBuilder'
import VirtualMachineBootOptionsBuilder from './VirtualMachineBootOptions'
import VirtualMachineConsolePreferences from "./VirtualMachineConsolePreferences"
import VirtualMachineAffinityInfo from "./VirtualMachineAffinityInfo"
import ResourceAllocationInfo from "./ResourceAllocationInfo"

export default class VirtualMachineConfigBuilder extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {
      '@xsi:type': 'vim25:VirtualMachineConfig'
    })
  }

  alternateGuestName (value) {
    if (!_.isString(value) || value === "") throw new Error('alternateGuestName must be a non-empty string')
    this.config.alternateGuestName = value
    return this
  }

  annotation (value) {
    if (!_.isString(value) || value === "") throw new Error('annotation must be a non-empty string')
    this.config.alternateGuestName = value
    return this
  }

  bootOptions (build) {
    if (!_.isFunction(build)) throw new Error('bootOptions must supply a builder function')
    builder = new VirtualMachineBootOptionsBuilder(this.apiVersion)
    build(builder)
    this.config.bootOptions = builder.config
    return this
  }

  changeTrackingEnabled (value) {
    if (!this.$versionGTE('4.0.0')) return
    if (!_.isBoolean(value)) throw new Error('changeTrackingEnabled must be a boolean')
    this.config.changeTrackingEnabled = value
    return this
  }

  changeVersion (value) {
    if (!_.isString(value) || value === "") throw new Error('changeVersion must be a non-empty string')
    this.config.changeVersion = value
    return this
  }

  consolePreferences (build) {
    if (!_.isFunction(build)) throw new Error('consolePreferences must supply a builder function')
    builder = new VirtualMachineConsolePreferences(this.apiVersion)
    build(builder)
    this.config.consolePreferences = builder.config
    return this
  }

  cpuAffinity (build) {
    if (!_.isFunction(build)) throw new Error('cpuAffinity must supply a builder function')
    builder = new VirtualMachineAffinityInfo(this.apiVersion)
    build(builder)
    this.config.cpuAffinity = builder.config
    return this
  }

  cpuAllocation (build) {
    if (!_.isFunction(build)) throw new Error('cpuAllocation must supply a builder function')
    builder = new ResourceAllocationInfo(this.apiVersion)
    build(builder)
    this.config.cpuAllocation = builder.config
    return this
  }

  name (value) {
    if (!_.isString(value) || value === "") throw new Error('name must be a non-empty string')
    this.config.name = value
    return this
  }
}