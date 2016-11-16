import _ from 'lodash'
import PropertyFilterSpec from '../objects/PropertyFilterSpec'

export function graphSpec (specSet) {
  let types = {}

  _.forEach(_.isArray(specSet) ? specSet : [specSet], (spec) => {
    if (spec.id) {
      _.forEach(_.isArray(spec.id) ? spec.id : [spec.id], (id) => {
        if (!_.isArray(spec.properties) || !spec.properties.length) {
          _.set(types, `["${spec.type}"].all["${id}"]`, true)
        } else {
          _.forEach(spec.properties, (prop) => {
            _.set(types, `["${spec.type}"].props["${prop}"]["${id}"]`, true)
          })
        }
      })
    } else {
      if (!_.isArray(spec.properties) || !spec.properties.length) {
        _.set(types, `["${spec.type}"].all`, true)
      } else {
        _.forEach(spec.properties, (prop) => {
          _.set(types, `["${spec.type}"].props["${prop}"].all`, true)
        })
      }
    }
  })
  return types
}

export default function retrieve (args = {}, options, callback) {
  if (_.isFunction(options)) {
    callback = options
    options = {}
  }
  callback = _.isFunction(callback) ? callback : () => false
  options = options || {}

  let retrieveMethod = this._VimPort.RetrievePropertiesEx ? 'RetrievePropertiesEx' : 'RetrieveProperties'
  args = _.isArray(args) ? args : [args]

  return Promise.all(_.map(args), (arg) => PropertyFilterSpec(arg, this).spec)
    .then((specSet) => {
      return this.method(retrieveMethod, {
        _this: this.serviceContent.propertyCollector,
        specSet,
        options
      }, callback)
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