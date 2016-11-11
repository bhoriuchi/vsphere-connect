import _ from 'lodash'
import nodexml from 'nodexml'

export function getSessionId(cookie) {
  let cookies = _.get(cookie, 'cookies')
  if (_.isString(cookies)) {
    let idx = cookies.indexOf('=');
    if (idx !== -1) return _.trim(cookies.substring(idx + 1), '"') || null;
  }
  return null;
}

export function errorHandler (err, callback, reject) {
  /*
  let e = {}
  if (err.body) {
    let errObj = nodexml.xml2obj(err.body)
    let { faultcode, faultstring } = _.get(errObj, 'soapenv:Envelope.soapenv:Body.soapenv:Fault', {})
    err = { faultcode, faultstring }
  }
  */
  callback(err)
  return reject(err)
}

export function resultHandler (result, callback, resolve) {
  callback(null, result)
  return resolve(result)
}

export default {
  getSessionId,
  errorHandler,
  resultHandler
}