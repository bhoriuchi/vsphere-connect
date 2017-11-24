import _ from 'lodash'
import BaseBuilder from "./BaseBuilder"
import VirtualMachineConfig from "./VirtualMachineConfig"

export default class VirtualMachine extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {})
  }

  folder (value) {
    value = this.$moRef(value)
    if (!this.$isMoRef(value)) throw new Error('folder is not a valid moRef')
    return this.$set('folder', value)
  }

  config (build) {
    if (this.$isConfigObject(build)) return this.$set('config', build)
    if (!_.isFunction(build)) throw new Error('config must supply a builder function or configuration object')
    let builder = new VirtualMachineConfig(this.apiVersion)
    build(builder)
    return this.$set('config', builder.$config())
  }

  pool (value) {
    value = this.$moRef(value)
    if (!this.$isMoRef(value)) throw new Error('pool is not a valid moRef')
    return this.$set('pool', value)
  }

  host (value) {
    value = this.$moRef(value)
    if (!this.$isMoRef(value)) throw new Error('host is not a valid moRef')
    return this.$set('host', value)
  }


}