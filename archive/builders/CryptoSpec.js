import BaseBuilder from "./BaseBuilder";

export default class CryptoSpec extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {
      '@xsi:type': 'vim25:CryptoSpec'
    })
  }
}