import _ from 'lodash'
import nodexml from 'nodexml'

export function getToken(headers) {
  return _.get(_.get(headers, 'set-cookie[0]', '').match(/"(.*)"/), '[1]', null)
}

export function convertRetrievedProperties (results) {
  let objs = _.get(results, 'objects') || _.get(results, 'returnval.objects')
  return _.map(_.isArray(objs) ? objs : [], (result) => {
    let o = {}
    let { obj, propSet } = result
    o.moRef = obj
    _.forEach(propSet, (prop) => {
      let { name, val } = prop
      _.set(o, name, val)
    })
    return o
  })
}

export function graphSpec (specSet) {
  let types = {}

  _.forEach(_.isArray(specSet) ? specSet : [specSet], (spec) => {
    if (_.isString(spec)) spec = { type: spec }
    if (!spec.type) return
    if (!_.has(types, spec.type)) _.set(types, spec.type, { ids: [], props: [] })
    if (spec.id) {
      let ids = _.isArray(spec.id) ? spec.id : [spec.id]
      types[spec.type].ids = _.union(types[spec.type].ids, ids)
    }
    if (spec.properties) {
      let props = _.isArray(spec.properties) ? spec.properties : [spec.properties]
      types[spec.type].props = _.union(types[spec.type].props, props)
    }
  })

  return _.map(types, (obj, type) => {
    return {
      type,
      id: obj.ids,
      properties: obj.props
    }
  })
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

export function moRef (type, value) {
  return { type, value }
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
  graphSpec,
  convertRetrievedProperties,
  getToken,
  errorHandler,
  resultHandler,
  makeDotPath,
  moRef
}