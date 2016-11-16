import _ from 'lodash'
import { SelectionSpec } from './SelectionSpec'

export class TraversalSpec extends SelectionSpec {
  constructor (obj) {
    super(obj)
    this.type = obj.type
    this.selectSet = _.isArray(obj.selectSet) ? _.map(obj.selectSet, (ss) => (new SelectionSpec(ss)).spec) : undefined
    this.path = obj.path
    this.skip = Boolean(obj.skip)
  }
  get spec () {
    return {
      name: this.name,
      selectSet: this.selectSet,
      type: this.type,
      path: this.path,
      skip: this.skip
    }
  }
}

export default function (obj) {
  return new TraversalSpec(obj)
}