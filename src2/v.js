export default class v {
  constructor (client, connection, req = {}) {
    this._client = client
    this._conn = connection
    this._req = req
    this._resolving = req.resolving || connection
  }

  type (name) {
    return new v(client, this._conn, {
      resolving: this._resolving.then(() => {
        let formalType = this._client.typeResolver(name)
        if (!formalType) return Promise.reject(new Error(`invalid type ${name}`))
        this._req.type = formalType
      })
    })
  }

  end () {
    return this._resolving
  }
}