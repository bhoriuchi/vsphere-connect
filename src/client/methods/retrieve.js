import _ from 'lodash'
import PropertyFilterSpec from '../objects/PropertyFilterSpec'
import { graphSpec, convertRetrievedProperties } from '../utils/index'

function getResults (result, objects, limit, offset, callback) {
  if (!result) {
    callback(null, objects)
    return Promise.resolve(objects)
  }
  let objs = _.union(objects, convertRetrievedProperties(result))

  if (result.token && (limit === undefined || objs.length < limit)) {
    return this.method('ContinueRetrievePropertiesEx', {
      _this: this.serviceContent.propertyCollector,
      token: result.token
    })
      .then(function(results) {
        return getResults.call(this, results, objs, limit, offset, callback)
      })
      .catch((err) => {
        callback(err)
        return Promise.reject(err)
      })
  } else {
    let results = _.slice(objs, offset || 0, limit || objs.length)
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

  let limit = options.limit
  let offset = options.offset || 0
  if (_.isNumber(offset) && _.isNumber(limit)) limit += offset

  let retrieveMethod = this._VimPort.RetrievePropertiesEx ? 'RetrievePropertiesEx' : 'RetrieveProperties'
  let specMap = _.map(graphSpec(args), (s) => PropertyFilterSpec(s, this).spec)
  return Promise.all(specMap)
    .then((specSet) => {
      return this.method(retrieveMethod, {
        _this: this.serviceContent.propertyCollector,
        specSet,
        options: {}
      })
        .then((result) => {
          return getResults.call(this, result, [], limit, offset, callback)
        })
        .catch((err) => {
          callback(err)
          return Promise.reject(err)
        })
    })
}