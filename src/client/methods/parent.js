import _ from 'lodash'
import Promise from 'bluebird'
import { InvalidTypeError } from '../../errors/index'
import { errorHandler, resultHandler, extractMoRef } from '../utils/index'

function getParent (type, id, parentType, root, resolve, reject, callback, match = null) {
  this.retrieve({
    type,
    id,
    properties: ['parent']
  }, (err, result) => {
    if (err) return errorHandler(err, callback, reject)
    let moRef = _.get(result, 'parent')
    let hasParent = !_.isEmpty(moRef)
    let atRoot = _.isEqual(this.serviceContent.rootFolder, moRef)

    if (!root) {
      if (!parentType || parentType === moRef.type) return resultHandler(moRef, callback, resolve)
      if (parentType && hasParent && parentType !== moRef.type) {
        return getParent.call(this, moRef.type, moRef.id, parentType, root, resolve, reject, callback, match)
      }
      return resultHandler(match, callback, resolve)
    }

    if (atRoot || !hasParent) return resultHandler(match, callback, resolve)
    return getParent.call(this, moRef.type, moRef.id, parentType, root, resolve, reject, callback, match)
  })
}

export default function parent (args = {}, options, callback) {
  if (_.isFunction(options)) {
    callback = options
    options = {}
  }
  callback = _.isFunction(callback) ? callback : () => null
  options = options || {}

  return new Promise((resolve, reject) => {
    let { root, parent } = args
    let { typeName, id, moRefError } = extractMoRef(args)
    let parentType = parent ? this.typeResolver(parent) : null

    if (moRefError) return errorHandler(moRefError, callback, reject)
    if (parent && !parentType) return errorHandler(new InvalidTypeError(parent), callback, reject)

    return getParent.call(this, typeName, id, parentType, root, resolve, reject, callback)
  })
}