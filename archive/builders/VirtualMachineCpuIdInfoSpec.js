import BaseBuilder from "./BaseBuilder"
import HostCpuIdInfo from "./HostCpuIdInfo";

export default class VirtualMachineCpuIdInfoSpec extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {
      '@xsi:type': 'vim25:VirtualMachineCpuIdInfoSpec'
    })
  }

  info (build) {
    if (this.$isConfigObject(build)) return this.$set('info', build)
    if (!_.isFunction(build)) throw new Error('info must supply a builder function or configuration object')
    let builder = new HostCpuIdInfo(this.apiVersion)
    build(builder)
    return this.$set('info', builder.$config())
  }
}