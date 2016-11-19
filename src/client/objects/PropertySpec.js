export class PropertySpec {
  constructor (obj) {
    this.obj = obj
  }
  get spec () {
    let hasProps = this.obj.properties.length > 0
    return {
      all: !hasProps,
      pathSet: this.obj.properties,
      type: this.obj.type
    }
  }
}

export default function (obj) {
  return new PropertySpec(obj)
}