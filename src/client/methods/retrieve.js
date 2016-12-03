import _ from 'lodash'
import PropertyFilterSpec from '../objects/PropertyFilterSpec'
import { graphSpec, convertRetrievedProperties } from '../utils/index'

function getResults (result, objects, offset, callback) {
  if (!result) {
    console.log('no results')
    callback(null, objects)
    return Promise.resolve(objects)
  }
  let objs = _.union(objects, convertRetrievedProperties(result))

  if (result.token) {
    console.log('token')
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
    console.log('here')
    let results = _.slice(objs, offset)
    callback(null, results)
    return Promise.resolve(results)
  }
}

export default function retrieve (args = {}, options, callback) {
  if (_.isFunction(options)) {
    callback = options
    options = {}
  }
  callback = _.isFunction(callback) ? callback : () => false
  options = options || {}
  let maxObjects = options.maxObjects || options.limit
  let offset = options.offset || 0
  if (offset !== undefined && maxObjects !== undefined) maxObjects += offset

  console.log(maxObjects)

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
          return getResults.call(this, result, [], offset, callback)
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