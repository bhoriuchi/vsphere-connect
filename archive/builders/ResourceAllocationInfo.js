import BaseBuilder from "./BaseBuilder"
import SharesInfo from "./SharesInfo"

export default class ResourceAllocationInfo extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {
      '@xsi:type': 'vim25:ResourceAllocationInfo'
    })
  }

  expandableReservation (value) {
    if (!_.isBoolean(value)) throw new Error('expandableReservation must be a boolean')
    return this.$set('expandableReservation', value)
  }

  limit (value) {
    if (!_.isNumber(value) || value < -1) throw new Error('limit must be an integer >= -1')
    return this.$set('limit', value)
  }

  overheadLimit (value) {
    if (!_.isNumber(value) || value < -1) throw new Error('overheadLimit must be an integer >= -1')
    return this.$set('overheadLimit', value)
  }

  reservation (value) {
    if (!_.isNumber(value) || value < 1) throw new Error('reservation must be an integer >= 1')
    return this.$set('reservation', value)
  }

  shares (build) {
    if (this.$isConfigObject(build)) return this.$set('shares', build)
    if (!_.isFunction(build)) throw new Error('shares must supply a builder function or configuration object')
    let builder = new SharesInfo(this.apiVersion)
    build(builder)
    return this.$set('shares', builder.$config())
  }
}