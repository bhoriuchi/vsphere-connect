import _ from 'lodash'
import BaseBuilder from "./BaseBuilder"
import VirtualDeviceConfigSpecBackingSpec from "./VirtualDeviceConfigSpecBackingSpec";

export default class VirtualDeviceConfigSpec extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {
      '@xsi:type': 'vim25:VirtualDeviceConfigSpec'
    })
  }

  backing (build) {
    if (!this.$versionGTE('6.5.0')) return
    if (this.$isConfigObject(build)) return this.$set('backing', build)
    if (!_.isFunction(build)) throw new Error('backing must supply a builder function or configuration object')
    let builder = new VirtualDeviceConfigSpecBackingSpec(this.apiVersion)
    build(builder)
    return this.$push('backing', builder.$config())
  }

  device (type, build) {
    if (this.$isConfigObject(build)) return this.$set('device', build)
    if (!_.isFunction(build)) throw new Error('device must supply a builder function or configuration object')

    switch (_.toLower(type)) {
      case 'cdrom', 'virtualcdrom':
        break
      case 'idecontroller', 'virtualidecontroller':
        break
      case 'nvmecontroller', 'virtualnvmecontroller':
        break
    }
  }

  cdrom (build) {

  }


}