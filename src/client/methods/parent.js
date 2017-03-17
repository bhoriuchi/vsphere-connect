import _ from 'lodash'
import Promise from 'bluebird'
import { InvalidTypeError } from '../../errors/index'
import { extractMoRef } from '../utils/index'

function getParent (type, id, parentType, root, resolve, reject, match = null) {
  this.retrieve({ type, id, properties: ['parent'] })
    .then(result => {
      let moRef = _.get(result, 'parent')
      let hasParent = !_.isEmpty(moRef)
      let atRoot = _.isEqual(this.serviceContent.rootFolder, moRef)

      if (!root) {
        if (!parentType || parentType === moRef.type) return resolve(moRef)
        if (parentType && hasParent && parentType !== moRef.type) {
          return getParent.call(this, moRef.type, moRef.id, parentType, root, resolve, reject, match)
        }
        return resolve(match)
      }

      if (atRoot || !hasParent) return resolve(match)
      return getParent.call(this, moRef.type, moRef.id, parentType, root, resolve, reject, match)
    }, reject)
}

export default function parent (args, options) {
  return new Promise((resolve, reject) => {
    options = _.isObject(options) ? options : {}
    let { root, parent } = _.isObject(args) ? args : {}
    let { typeName, id, moRefError } = extractMoRef(args)
    let parentType = parent ? this.typeResolver(parent) : null

    if (moRefError) return reject(moRefError)
    if (parent && !parentType) return reject(new InvalidTypeError(parent))

    return getParent.call(this, typeName, id, parentType, root, resolve, reject)
  })
}