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
    this.config.expandableReservation = value
    return this
  }

  limit (value) {
    if (!_.isNumber(value) || value < -1) throw new Error('limit must be an integer >= -1')
    this.config.limit = value
    return this
  }

  overheadLimit (value) {
    if (!_.isNumber(value) || value < -1) throw new Error('overheadLimit must be an integer >= -1')
    this.config.overheadLimit = value
    return this
  }

  reservation (value) {
    if (!_.isNumber(value) || value < 1) throw new Error('reservation must be an integer >= 1')
    this.config.reservation = value
    return this
  }

  shares (build) {
    if (!_.isFunction(build)) throw new Error('shares must supply a builder function')
    builder = new SharesInfo(this.apiVersion)
    build(builder)
    this.config.shares = builder.config
    return this
  }
}