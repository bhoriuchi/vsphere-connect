import _ from 'lodash'

// Strategy taken from node-soap/strong-soap
export default class Security {
  constructor (options = {}) {
    this.options = options
  }

  addOptions (options) {
    _.merge(this.options, options)
  }

  addHttpHeaders (headers) {
    _.noop(headers)
  }

  addSoapHeaders (headerElement) {
    _.noop(headerElement)
  }

  postProcess (envelopeElement, headerElement, bodyElement) {
    _.noop(envelopeElement, headerElement, bodyElement)
  }
}
