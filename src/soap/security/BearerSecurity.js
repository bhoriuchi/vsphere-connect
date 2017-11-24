import Security from './Security'

export class BearerSecurity extends Security {
  constructor (token, options) {
    super(options)
    this.token = token
  }

  addHttpHeaders (headers) {
    headers.Authorization = `Bearer ${this.token}`
  }
}

export default function (token, options) {
  return new BearerSecurity(token, options)
}
