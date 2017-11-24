import _ from 'lodash'
import TraversalSpec from './TraversalSpec'

export class SelectionSpec {
  constructor (obj) {
    this.obj = obj
  }
  get spec () {
    if (_.has(this.obj, 'listSpec.type') && _.has(this.obj, 'listSpec.path')) {
      return TraversalSpec(this.obj.listSpec).spec
    }
    return {
      name: _.get(this.obj, 'name')
    }
  }
}

export default function (obj) {
  return new SelectionSpec(obj)
}
