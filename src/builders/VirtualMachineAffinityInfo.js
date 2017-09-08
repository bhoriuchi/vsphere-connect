import _ from 'lodash'
import BaseBuilder from "./BaseBuilder"

export default class VirtualMachineAffinityInfo extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {
      '@xsi:type': 'vim25:VirtualMachineAffinityInfo'
    })
  }

  affinitySet (value) {
    if (!_.isArray(value) || !value.length) throw new Error('affinitySet requires an array of integers')
    this.config.affinitySet = _.filter(value, _.isNumber)
    return this
  }
}