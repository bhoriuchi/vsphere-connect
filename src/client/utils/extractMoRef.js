import _ from 'lodash'
import { ObjectReferenceError, InvalidTypeError } from '../../errors/index'

export default function extractMoRef (args) {
  let { type, id, moRef } = args
  let moRefError = null

  if (_.isObject(moRef)) {
    type = moRef.type
    id = moRef.value
  }

  let typeName = this.typeResolver(type)
  if (!typeName) {
    moRefError = new InvalidTypeError(type)
  } else if (!id) {
    moRefError = new ObjectReferenceError()
  }

  return {
    moRefError,
    typeName,
    id,
    moRef: {
      type: typeName,
      value: id
    }
  }
}