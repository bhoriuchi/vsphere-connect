import _ from 'lodash'
import BaseBuilder from "./BaseBuilder"

export default class SharesInfo extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {
      '@xsi:type': 'vim25:SharesInfo'
    })
  }

  level (value) {
    if (!_.isString(value)) throw new Error('level must be a string')
    value = _.toLower(value)
    switch (value) {
      case 'custom', 'high', 'low', 'normal':
        this.config.level = value
        break
      default:
        throw new Error(`${value} is not a valid value for level, acceptable values are "custom", "high", "low", "normal"`)
    }
    return this
  }

  shares (value) {
    if (!_.isNumber(value) || value < 0) throw new Error('shares must be an integer >= 0')
    this.config.shares = value
    return this
  }
}