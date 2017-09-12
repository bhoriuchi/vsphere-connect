import _ from 'lodash'
import BaseBuilder from './BaseBuilder'
import VirtualMachineBootOptions from './VirtualMachineBootOptions'
import VirtualMachineConsolePreferences from "./VirtualMachineConsolePreferences"
import VirtualMachineAffinityInfo from "./VirtualMachineAffinityInfo"
import ResourceAllocationInfo from "./ResourceAllocationInfo"
import VirtualMachineCpuIdInfoSpec from "./VirtualMachineCpuIdInfoSpec"
import CryptoSpec from "./CryptoSpec"
import VirtualDeviceConfigSpec from "./VirtualDeviceConfigSpec"

export default class VirtualMachineConfig extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {
      '@xsi:type': 'vim25:VirtualMachineConfig'
    })
  }

  alternateGuestName (value) {
    if (!_.isString(value) || value === "") throw new Error('alternateGuestName must be a non-empty string')
    return this.$set('alternateGuestName', value)
  }

  annotation (value) {
    if (!_.isString(value) || value === "") throw new Error('annotation must be a non-empty string')
    return this.$set('annotation', value)
  }

  bootOptions (build) {
    if (this.$isConfigObject(build)) return this.$set('bootOptions', build)
    if (!_.isFunction(build)) throw new Error('bootOptions must supply a builder function or configuration object')
    let builder = new VirtualMachineBootOptions(this.apiVersion)
    build(builder)
    return this.$set('bootOptions', builder.$config())
  }

  changeTrackingEnabled (value) {
    if (!this.$versionGTE('4.0.0')) return
    if (!_.isBoolean(value)) throw new Error('changeTrackingEnabled must be a boolean')
    return this.$set('changeTrackingEnabled', value)
  }

  changeVersion (value) {
    if (!_.isString(value) || value === "") throw new Error('changeVersion must be a non-empty string')
    return this.$set('changeVersion', value)
  }

  consolePreferences (build) {
    if (this.$isConfigObject(build)) return this.$set('consolePreferences', build)
    if (!_.isFunction(build)) throw new Error('consolePreferences must supply a builder function or configuration object')
    let builder = new VirtualMachineConsolePreferences(this.apiVersion)
    build(builder)
    return this.$set('consolePreferences', builder.$config())
  }

  cpuAffinity (build) {
    if (this.$isConfigObject(build)) return this.$set('cpuAffinity', build)
    if (!_.isFunction(build)) throw new Error('cpuAffinity must supply a builder function or configuration object')
    let builder = new VirtualMachineAffinityInfo(this.apiVersion)
    build(builder)
    return this.$set('cpuAffinity', builder.$config())
  }

  cpuAllocation (build) {
    if (this.$isConfigObject(build)) return this.$set('cpuAllocation', build)
    if (!_.isFunction(build)) throw new Error('cpuAllocation must supply a builder function or configuration object')
    let builder = new ResourceAllocationInfo(this.apiVersion)
    build(builder)
    return this.$set('cpuAllocation', builder.$config())
  }

  cpuFeatureMask (build) {
    if (this.$isConfigObject(build)) return this.$set('cpuFeatureMask', build)
    if (!_.isFunction(build)) throw new Error('cpuFeatureMask must supply a builder function or configuration object')
    let builder = new VirtualMachineCpuIdInfoSpec(this.apiVersion)
    build(builder)
    return this.$push('cpuFeatureMask', builder.$config())
  }

  cpuHotAddEnabled (value) {
    if (!this.$versionGTE('4.0.0')) return
    if (!_.isBoolean(value)) throw new Error('cpuHotAddEnabled must be a boolean value')
    return this.$set('cpuHotAddEnabled', value)
  }

  cpuHotRemoveEnabled (value) {
    if (!this.$versionGTE('4.0.0')) return
    if (!_.isBoolean(value)) throw new Error('cpuHotRemoveEnabled must be a boolean value')
    return this.$set('cpuHotRemoveEnabled', value)
  }

  crypto (build) {
    if (!this.$versionGTE('6.5.0')) return
    if (this.$isConfigObject(build)) return this.$set('crypto', build)
    if (!_.isFunction(build)) throw new Error('crypto must supply a builder function or configuration object')
    let builder = new CryptoSpec(this.apiVersion)
    build(builder)
    return this.$push('crypto', builder.$config())
  }

  deviceChange (build) {
    if (this.$isConfigObject(build)) return this.$set('deviceChange', build)
    if (!_.isFunction(build)) throw new Error('deviceChange must supply a builder function or configuration object')
    let builder = new VirtualDeviceConfigSpec(this.apiVersion)
    build(builder)
    return this.$push('deviceChange', builder.$config())
  }

  name (value) {
    if (!_.isString(value) || value === "") throw new Error('name must be a non-empty string')
    return this.$set('name', value)
  }
}