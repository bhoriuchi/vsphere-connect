import _ from 'lodash'
import PropertyFilterSpec from '../objects/PropertyFilterSpec'
import { graphSpec, convertRetrievedProperties } from '../utils/index'

function getResults (result, objects, callback) {
  if (!result) {
    callback(null, objects)
    return Promise.resolve(objects)
  }
  let objs = _.union(objects, convertRetrievedProperties(result))

  if (result.token) {
    return this.method('ContinueRetrievePropertiesEx', {
      _this: this.serviceContent.propertyCollector,
      token: result.token
    })
      .then(function(results) {
        return getResults.call(this, results, objs, callback)
      })
      .catch((err) => {
        callback(err)
        return Promise.reject(err)
      })
  } else {
    callback(null, objs)
    return Promise.resolve(objs)
  }
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
      return this.method(retrieveMethod, {
        _this: this.serviceContent.propertyCollector,
        specSet,
        options
      })
        .then((result) => {
          return getResults.call(this, result, [], callback)
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