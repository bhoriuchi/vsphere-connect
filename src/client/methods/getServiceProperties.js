import _ from 'lodash'

export default function getServiceProperties (args = {}, callback = () => false) {
  let { id, type, properties } = args
  let retrieveProperties = this._VimPort.RetrievePropertiesEx ? 'RetrievePropertiesEx' : 'RetrieveProperties'

  let objectSpec = { obj: { type, value: id } }
  let propertySpec = _.isArray(properties) ? { type, pathSet: properties } : { type, all: true }

  return this.method(retrieveProperties, {
    _this: this.serviceContent.propertyCollector,
    specSet: [
      {
        propSet: [propertySpec],
        objectSet: [objectSpec]
      }
    ],
    options: {}
  }, callback)
}