import _ from 'lodash'
import BaseBuilder from "./BaseBuilder"
import CryptoSpec from './CryptoSpec'

export default class VirtualDeviceConfigSpecBackingSpec extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {
      '@xsi:type': 'vim25:VirtualDeviceConfigSpecBackingSpec'
    })
  }

  crypto (build) {
    if (!this.$versionGTE('6.5.0')) return
    if (this.$isConfigObject(build)) return this.$set('crypto', build)
    if (!_.isFunction(build)) throw new Error('crypto must supply a builder function or configuration object')
    let builder = new CryptoSpec(this.apiVersion)
    build(builder)
    return this.$push('crypto', builder.$config())
  }

  parent (build) {
    if (!this.$versionGTE('6.5.0')) return
    if (this.$isConfigObject(build)) return this.$set('parent', build)
    if (!_.isFunction(build)) throw new Error('parent must supply a builder function or configuration object')
    let builder = new VirtualDeviceConfigSpecBackingSpec(this.apiVersion)
    build(builder)
    return this.$push('parent', builder.$config())
  }
}