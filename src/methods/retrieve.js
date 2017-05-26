import _ from 'lodash'
import Promise from 'bluebird'
import PropertyFilterSpec from '../objects/PropertyFilterSpec'
import graphSpec from '../common/graphSpec'
import convertRetrievedProperties from '../common/convertRetrievedProperties'
import orderDoc from '../common/orderDoc'

function getResults (result, objects, limit, skip, nth, orderBy, moRef, fn) {
  if (!result) return Promise.resolve(objects)
  let objs = _.union(objects, convertRetrievedProperties(result, moRef))
  let _this = this.serviceContent.propertyCollector

  if (result.token) {
    return this.method('ContinueRetrievePropertiesEx', { _this, token: result.token })
      .then(results => getResults.call(this, results, objs, limit, skip, nth, orderBy, moRef, fn))
  }

  objs = orderBy
    ? _.orderBy(objs, orderBy.fields, orderBy.directions)
    : objs

  if (nth !== null) {
    return Promise.resolve(_.nth(objs, nth))
  }

  let results = _.slice(objs, skip || 0, limit || objs.length)
  return Promise.resolve(fn(results))
}

export default function retrieve (args, options) {
  args = _.isObject(args) ? _.cloneDeep(args) : {}
  options = _.isObject(options) ? _.cloneDeep(options) : {}

  let limit = options.limit
  let skip = options.skip || 0
  let nth = _.isNumber(options.nth) ? Math.ceil(options.nth) : null
  let properties = _.get(args, 'properties', [])
  let moRef = true // _.includes(properties, 'moRef') || _.includes(properties, 'id')
  let orderBy = options.orderBy
    ? orderDoc(options.orderBy)
    : null
  let fn = _.isFunction(options.resultHandler)
    ? options.resultHandler
    : result => result
  args.properties = _.without(properties, 'moRef', 'id', 'moRef.value', 'moRef.type')

  if (_.isNumber(skip) && _.isNumber(limit)) limit += skip

  let retrieveMethod = this._VimPort.RetrievePropertiesEx ? 'RetrievePropertiesEx' : 'RetrieveProperties'
  let specMap = _.map(graphSpec(args), s => PropertyFilterSpec(s, this).spec)
  let _this = this.serviceContent.propertyCollector

  return Promise.all(specMap)
    .then(specSet => {
      return this.method(retrieveMethod, { _this, specSet, options: {} })
        .then(result => getResults.call(this, result, [], limit, skip, nth, orderBy, moRef, fn))
    })
}