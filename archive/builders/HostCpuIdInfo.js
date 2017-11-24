import _ from 'lodash'
import BaseBuilder from "./BaseBuilder"

export default class HostCpuIdInfo extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {
      '@xsi:type': 'vim25:HostCpuIdInfo'
    })
  }

  eax (value) {
    if (!_.isString(value) || value === "") throw new Error('eax must be a non-empty string')
    return this.$set('eax', value)
  }

  ebx (value) {
    if (!_.isString(value) || value === "") throw new Error('ebx must be a non-empty string')
    return this.$set('ebx', value)
  }

  ecx (value) {
    if (!_.isString(value) || value === "") throw new Error('ecx must be a non-empty string')
    return this.$set('ecx', value)
  }

  edx (value) {
    if (!_.isString(value) || value === "") throw new Error('edx must be a non-empty string')
    return this.$set('edx', value)
  }

  level (value) {
    if (!_.isNumber(value)) throw new Error('level must be integer')
    return this.$set('level', value)
  }

  vendor (value) {
    if (!_.isString(value) || value === "") throw new Error('vendor must be a non-empty string')
    return this.$set('vendor', value)
  }
}