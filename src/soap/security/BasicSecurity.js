import Security from './Security';

export class BasicSecurity extends Security {
  constructor(username, password, options) {
    super(options);
    this.credential = new Buffer(`${username}:${password}`).toString('base64');
  }

  addHttpHeaders(headers) {
    headers.Authorization = `Basic ${this.credential}`;
  }
}

export default function(username, password, options) {
  return new BasicSecurity(username, password, options);
}
