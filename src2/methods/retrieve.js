import _ from 'lodash'
import Promise from 'bluebird'
import PropertyFilterSpec from '../objects/PropertyFilterSpec'
import graphSpec from '../common/graphSpec'
import convertRetrievedProperties from '../common/convertRetrievedProperties'

function getResults (result, objects, limit, offset) {
  if (!result) return Promise.resolve(objects)
  let objs = _.union(objects, convertRetrievedProperties(result))
  let _this = this.serviceContent.propertyCollector

  if (result.token && (limit === undefined || objs.length < limit)) {
    return this.method('ContinueRetrievePropertiesEx', { _this, token: result.token })
      .then(results => getResults.call(this, results, objs, limit, offset))
  }

  let results = _.slice(objs, offset || 0, limit || objs.length)
  return Promise.resolve(results)
}

export default function retrieve (args, options) {
  args = _.isObject(args) ? args : {}
  options = _.isObject(options) ? options : {}

  let limit = options.limit
  let offset = options.offset || 0
  if (_.isNumber(offset) && _.isNumber(limit)) limit += offset

  let retrieveMethod = this._VimPort.RetrievePropertiesEx ? 'RetrievePropertiesEx' : 'RetrieveProperties'
  let specMap = _.map(graphSpec(args), s => PropertyFilterSpec(s, this).spec)
  let _this = this.serviceContent.propertyCollector

  return Promise.all(specMap)
    .then(specSet => {
      return this.method(retrieveMethod, { _this, specSet, options: {} })
        .then(result => getResults.call(this, result, [], limit, offset))
    })
}