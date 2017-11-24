import _ from 'lodash'
import Security from './Security'

export class CookieSecurity extends Security {
  constructor (cookie, options) {
    super(options)
    const _cookie = _.get(cookie, 'set-cookie', cookie)
    const cookies = _.map(
      _.castArray(_cookie ),
      c => c.split(';')[0]
    )

    this.cookie = cookies.join('; ')
  }

  addHttpHeaders (headers) {
    headers.Cookie = this.cookie
  }
}

export default function (cookie, options) {
  return new CookieSecurity(cookie, options)
}
