import _ from 'lodash'
import { moRef } from '../common'

export class ObjectSpec {
  constructor (obj) {
    if (!obj.id) {
      this.obj = obj.containerView ? obj.containerView : moRef(obj.listSpec.type, obj.listSpec.id)
    } else {

    }
  }

  get spec () {

  }
}

export default function (obj) {
  return new ObjectSpec(obj)
}