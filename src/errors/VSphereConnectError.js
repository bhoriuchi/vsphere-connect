export default class VSphereConnectError extends Error {
  constructor (name, code, message) {
    super(message)
    this.name = name
    this.code = code
  }
}