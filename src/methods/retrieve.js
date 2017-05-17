import _ from 'lodash'
import Promise from 'bluebird'
import PropertyFilterSpec from '../objects/PropertyFilterSpec'
import graphSpec from '../common/graphSpec'
import convertRetrievedProperties from '../common/convertRetrievedProperties'

function getResults (result, objects, limit, offset, nth, orderBy, moRef) {
  if (!result) return Promise.resolve(objects)
  let objs = _.union(objects, convertRetrievedProperties(result, moRef))
  let _this = this.serviceContent.propertyCollector

  if (result.token) {
    return this.method('ContinueRetrievePropertiesEx', { _this, token: result.token })
      .then(results => getResults.call(this, results, objs, limit, offset, nth, orderBy, moRef))
  }

  objs = orderBy
    ? _.orderBy(objs, orderBy[0], orderBy[1])
    : objs

  if (nth !== null) {
    if (nth < 0 || nth >= objs.length - 1) return Promise.reject(new Error('nth selection out of range'))
    return Promise.resolve(objs[nth])
  }

  let results = _.slice(objs, offset || 0, limit || objs.length)
  return Promise.resolve(results)
}

export default function retrieve (args, options) {
  args = _.isObject(args) ? args : {}
  options = _.isObject(options) ? options : {}

  let limit = options.limit
  let offset = options.offset || 0
  let nth = _.isNumber(options.nth) ? Math.ceil(options.nth) : null
  let properties = _.get(args, 'properties', [])
  let moRef = _.includes(properties, 'moRef') || _.includes(properties, 'id')
  let orderBy = null

  if (_.isObject(options.orderBy)) {
    orderBy = [
      _.keys(options.orderBy),
      _.map(options.orderBy, dir => {
        return dir === 'desc' || dir === -1 ? 'desc' : 'asc'
      })
    ]
  }

  if (_.isNumber(offset) && _.isNumber(limit)) limit += offset

  let retrieveMethod = this._VimPort.RetrievePropertiesEx ? 'RetrievePropertiesEx' : 'RetrieveProperties'
  let specMap = _.map(graphSpec(args), s => PropertyFilterSpec(s, this).spec)
  let _this = this.serviceContent.propertyCollector

  return Promise.all(specMap)
    .then(specSet => {
      return this.method(retrieveMethod, { _this, specSet, options: {} })
        .then(result => getResults.call(this, result, [], limit, offset, nth, orderBy, moRef))
    })
}