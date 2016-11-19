import _ from 'lodash'
import TraversalSpec from './TraversalSpec'

export class SelectionSpec {
  constructor (obj) {
    this.obj = obj
  }
  get spec () {
    if (_.has(obj, 'listSpec.type') && _.has(obj, 'listSpec.path')) {
      return TraversalSpec(this.obj.listSpec).spec
    }
    return {
      name: this.obj.name
    }
  }
}

export default function (obj) {
  return new SelectionSpec(obj)
}