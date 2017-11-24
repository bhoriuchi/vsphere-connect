export class TraversalSpec {
  constructor ({ type, path }) {
    this.type = type
    this.path = path
  }
  get spec () {
    return {
      // name: `${this.type}${Date.now()}`,
      type: this.type,
      path: this.path,
      skip: false
    }
  }
}

export default function (obj) {
  return new TraversalSpec(obj)
}
