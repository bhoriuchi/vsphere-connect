export class SelectionSpec {
  constructor (obj) {
    this.name = obj.name
  }
  get spec () {
    return {
      name: this.name
    }
  }
}

export default function (obj) {
  return new SelectionSpec(obj)
}