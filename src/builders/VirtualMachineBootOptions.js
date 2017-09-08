import _ from 'lodash'
import BaseBuilder from './BaseBuilder'

export default class VirtualMachineBootOptionsBuilder extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {
      '@xsi:type': 'vim25:VirtualMachineBootOptions'
    })
  }

  bootDelay (value) {
    if (!_.isNumber(value) || value < 0) throw new Error('bootDelay must be a number >= 0')
    this.config.bootDelay = value
    return this
  }

  bootOrder (value) {
    if (!this.$versionGTE('5.0.0')) return
    if (!_.isArray(value) || value.length < 1) throw new Error('bootOrder must specify an array of device types')
    this.config.bootOrder = []

    order = _.reduce(value, (accum, v) => {
      if (!_.isString(v)) return
      v = _.toLower(v)

      if (_.includes(['cdrom', 'disk', 'ethernet', 'floppy'], v) && !_.includes(accum, v)) {
        accum.push(v)
      }
      return accum
    }, [])

    _.forEach(order, dev => {
      switch (dev) {
        case 'cdrom':
          this.config.bootOrder.push({
            '@xsi:type': 'vim25:VirtualMachineBootOptionsBootableCdromDevice'
          })
          break

        case 'disk':
          this.config.bootOrder.push({
            '@xsi:type': 'vim25:VirtualMachineBootOptionsBootableDiskDevice'
          })
          break

        case 'ethernet':
          this.config.bootOrder.push({
            '@xsi:type': 'vim25:VirtualMachineBootOptionsBootableEthernetDevice'
          })
          break

        case 'floppy':
          this.config.bootOrder.push({
            '@xsi:type': 'vim25:VirtualMachineBootOptionsBootableFloppyDevice'
          })
          break
      }
    })

    return this
  }

  bootRetryDelay (value) {
    if (!this.$versionGTE('4.1.0')) return
    if (!_.isNumber(value) || value < 0) throw new Error('bootRetryDelay must be a number >= 0')
    this.config.bootRetryDelay = value
    return this
  }

  bootRetryEnabled (value) {
    if (!this.$versionGTE('4.1.0')) return
    if (!_.isBoolean(value)) throw new Error('bootRetryEnabled must be a boolean')
    this.config.bootRetryRetry = value
    return this
  }

  efiSecureBootEnabled (value) {
    if (!this.$versionGTE('6.5.0')) return
    if (!_.isBoolean(value)) throw new Error('efiSecureBootEnabled must be a boolean')
    this.config.efiSecureBootEnabled = value
    return this
  }

  enterBIOSSetup (value) {
    if (!_.isBoolean(value)) throw new Error('enterBIOSSetup must be a boolean')
    this.config.enterBIOSSetup = value
    return this
  }

  networkBootProtocol (value) {
    if (!this.$versionGTE('6.0.0')) return
    if (!_.isString(value)) throw new Error('networkBootProtocol must be a non-empty string')
    this.config.networkBootProtocol = value
    return this
  }
}