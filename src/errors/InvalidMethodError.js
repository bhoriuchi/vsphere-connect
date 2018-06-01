import VSphereConnectError from './VSphereConnectError';

export const ERR_INVALID_METHOD = 'ERR_INVALID_METHOD';

export default class InvalidMethodError extends VSphereConnectError {
  constructor(method) {
    super(
      'InvalidMethodError',
      ERR_INVALID_METHOD,
      `${method} is not a valid method`,
    );
  }
}
