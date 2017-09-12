import BaseBuilder from "./BaseBuilder"

export default class VirtualCdrom extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {
      '@xsi:type': 'vim25:VirtualCdrom'
    })
  }
}