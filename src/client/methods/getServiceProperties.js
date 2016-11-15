export default function getServiceProperties (args = {}, callback = () => false) {
  let { id, type, properties } = args
  let retrieveProperties = this._VimPort.RetrievePropertiesEx ? 'RetrievePropertiesEx' : 'RetrieveProperties'

}