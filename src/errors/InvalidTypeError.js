import VSphereConnectError from './VSphereConnectError';

export const ERR_INVALID_TYPE = 'ERR_INVALID_TYPE';

export default class InvalidTypeError extends VSphereConnectError {
  constructor(type) {
    super(
      'InvalidTypeError',
      ERR_INVALID_TYPE,
      `${type} cannot be resolved to a valid vim type`,
    );
  }
}
