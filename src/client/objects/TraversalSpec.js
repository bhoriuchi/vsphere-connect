import _ from 'lodash'

export class TraversalSpec {
  constructor ({ type, path }) {
    this.type = type
    this.path = path
  }
  get spec () {
    return {
      type: this.type,
      path: this.path,
      skip: false
    }
  }
}

export default function (obj) {
  return new TraversalSpec(obj)
}