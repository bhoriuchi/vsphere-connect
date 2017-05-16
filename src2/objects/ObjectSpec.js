import _ from 'lodash'
import SelectionSpec from './SelectionSpec'
import { moRef } from '../utils/index'

export class ObjectSpec {
  constructor (obj) {
    this.obj = obj
  }

  get spec () {
    if (!this.obj.id.length) {
      return [
        {
          obj: this.obj.containerView ? this.obj.containerView : moRef(this.obj.listSpec.type, this.obj.listSpec.id),
          skip: true,
          selectSet: [SelectionSpec(this.obj).spec]
        }
      ]
    } else {
      return _.map(this.obj.id, id => {
        return { obj: moRef(this.obj.type, id) }
      })
    }
  }
}

export default function (obj) {
  return new ObjectSpec(obj)
}