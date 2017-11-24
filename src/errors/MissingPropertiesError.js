import VSphereConnectError from './VSphereConnectError'

export const ERR_MISSING_PROPS = 'ERR_MISSING_PROPS'

export default class MissingPropertiesError extends VSphereConnectError {
  constructor (props) {
    super(
      'MissingPropertiesError',
      ERR_MISSING_PROPS,
      `missing required properties ${props.join(', ')}`
    )
  }
}
