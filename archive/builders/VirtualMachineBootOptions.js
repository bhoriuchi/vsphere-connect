import _ from 'lodash'
import BaseBuilder from './BaseBuilder'

export default class VirtualMachineBootOptions extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {
      '@xsi:type': 'vim25:VirtualMachineBootOptions'
    })
  }

  bootDelay (value) {
    if (!_.isNumber(value) || value < 0) throw new Error('bootDelay must be a number >= 0')
    return this.$set('bootDelay', value)
  }

  bootOrder (value) {
    if (!this.$versionGTE('5.0.0')) return

    switch (_.toLower(value)) {
      case 'cdrom':
        this.$push('bootOrder', {
          '@xsi:type': 'vim25:VirtualMachineBootOptionsBootableCdromDevice'
        })
        break

      case 'disk':
        this.$push('bootOrder', {
          '@xsi:type': 'vim25:VirtualMachineBootOptionsBootableDiskDevice'
        })
        break

      case 'ethernet':
        this.$push('bootOrder', {
          '@xsi:type': 'vim25:VirtualMachineBootOptionsBootableEthernetDevice'
        })
        break

      case 'floppy':
        this.$push('bootOrder', {
          '@xsi:type': 'vim25:VirtualMachineBootOptionsBootableFloppyDevice'
        })
        break

      default:
        throw new Error('invalid boot device type; must be "cdrom", "disk", "ethernet", or "floppy"')
    }

    return this
  }

  bootRetryDelay (value) {
    if (!this.$versionGTE('4.1.0')) return
    if (!_.isNumber(value) || value < 0) throw new Error('bootRetryDelay must be a number >= 0')
    return this.$set('bootRetryDelay', value)
  }

  bootRetryEnabled (value) {
    if (!this.$versionGTE('4.1.0')) return
    if (!_.isBoolean(value)) throw new Error('bootRetryEnabled must be a boolean')
    return this.$set('bootRetryEnabled', value)
  }

  efiSecureBootEnabled (value) {
    if (!this.$versionGTE('6.5.0')) return
    if (!_.isBoolean(value)) throw new Error('efiSecureBootEnabled must be a boolean')
    return this.$set('efiSecureBootEnabled', value)
  }

  enterBIOSSetup (value) {
    if (!_.isBoolean(value)) throw new Error('enterBIOSSetup must be a boolean')
    return this.$set('enterBIOSSetup', value)
  }

  networkBootProtocol (value) {
    if (!this.$versionGTE('6.0.0')) return
    if (!_.isString(value)) throw new Error('networkBootProtocol must be a non-empty string')
    return this.$set('networkBootProtocol', value)
  }
}