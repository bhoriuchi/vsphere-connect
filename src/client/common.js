import _ from 'lodash'
import nodexml from 'nodexml'

export function getSessionId(headers) {
  let [ key, sessionId ] = _.first(_.get(headers, 'set-cookie', ';').split(';')).split('=')
  return sessionId
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

export function moRef (type, id) {
  if (_.isObject(type) && !id) {
    return {
      type: _.get(type, '$attributes.type') || _.get(type, '$attributes.xsi:type'),
      id: _.get(type, '$value')
    }
  }
  return {
    $attributes: { type },
    $value: id
  }
}

export function resultHandler (result, callback, resolve) {
  callback(null, result)
  return resolve(result)
}

export function makeDotPath (obj, list = [], path = []) {
  _.forEach(obj, (val, key) => {
    let prop = path.slice(0)
    prop.push(key)
    if (val === true) list.push(prop.join('.'))
    else makeDotPath(val, list, prop)
  })
  return list
}


export default {
  getSessionId,
  errorHandler,
  resultHandler,
  makeDotPath,
  moRef
}