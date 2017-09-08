import _ from 'lodash'
import BaseBuilder from "./BaseBuilder"

export default class VirtualMachineConsolePreferences extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {
      '@xsi:type': 'vim25:VirtualMachineConsolePreferences'
    })
  }

  closeOnPowerOffOrSuspend (value) {
    if (!_.isBoolean(value)) throw new Error('closeOnPowerOffOrSuspend must be a boolean')
    this.config.closeOnPowerOffOrSuspend = value
    return this
  }

  enterFullScreenOnPowerOn (value) {
    if (!_.isBoolean(value)) throw new Error('enterFullScreenOnPowerOn must be a boolean')
    this.config.enterFullScreenOnPowerOn = value
    return this
  }

  powerOnWhenOpened (value) {
    if (!_.isBoolean(value)) throw new Error('powerOnWhenOpened must be a boolean')
    this.config.powerOnWhenOpened = value
    return this
  }
}