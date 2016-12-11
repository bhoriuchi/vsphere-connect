import VSphereConnectError from './VSphereConnectError'

export const ERR_OBJECT_REF = 'ERR_OBJ_REF'

export default class ObjectReferenceError extends VSphereConnectError {
  constructor () {
    super('ObjectReferenceError', ERR_OBJECT_REF, 'Object reference cannot be determined. Please supply' +
      'either a valid moRef object ({ type, value }) or type and id')
  }
}