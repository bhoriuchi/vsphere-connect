import _ from 'lodash'
import BaseBuilder from "./BaseBuilder"

export default class A extends BaseBuilder {
  constructor (apiVersion) {
    super(apiVersion, {
      '@xsi:type': 'vim25:'
    })
  }
}