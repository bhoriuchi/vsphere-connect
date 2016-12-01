import _ from 'lodash'
import PropertyFilterSpec from '../objects/PropertyFilterSpec'
import { convertRetrievedProperties } from '../common'

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

export default function retrieve (args = {}, options, callback) {
  if (_.isFunction(options)) {
    callback = options
    options = {}
  }
  callback = _.isFunction(callback) ? callback : () => false
  options = options || {}

  let retrieveMethod = this._VimPort.RetrievePropertiesEx ? 'RetrievePropertiesEx' : 'RetrieveProperties'
  let specMap = _.map(graphSpec(args), (s) => PropertyFilterSpec(s, this).spec)
  return Promise.all(specMap)
    .then((specSet) => {
      console.log(JSON.stringify(specSet, null, '  '))
      return this.method(retrieveMethod, {
        _this: this.serviceContent.propertyCollector,
        specSet,
        options
      })
        .then((result) => {
          let obj = convertRetrievedProperties(result)
          callback(null, obj)
          return obj
        })
        .catch((err) => {
          callback(err)
          return Promise.reject(err)
        })
    })
}








/*
let pl2 = {
  _this: client.serviceContent.propertyCollector,
  specSet: [
    {
      objectSet: [
        {
          obj: {
            $attributes: { type: 'SessionManager' },
            $value: 'SessionManager'
          }
        }
      ],
      propSet: [
        {
          pathSet: ['currentSession', 'sessionList'],
          type: 'SessionManager'
        }
      ]
    }
  ],
  options: {}
}
  */