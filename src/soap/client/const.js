export const SOAP = {
  'http://schemas.xmlsoap.org/wsdl/soap/': {
    version: '1.1',
    ns: 'http://schemas.xmlsoap.org/wsdl/soap/',
    envelope: 'http://schemas.xmlsoap.org/soap/envelope/',
    encoding: 'http://schemas.xmlsoap.org/soap/encoding/',
    contentType: 'text/xml'
  },
  'http://schemas.xmlsoap.org/wsdl/soap12/': {
    version: '1.2',
    ns: 'http://schemas.xmlsoap.org/wsdl/soap12/',
    encoding: 'http://www.w3.org/2003/05/soap-encoding/',
    envelope: 'http://www.w3.org/2003/05/soap-envelope',
    contentType: 'application/soap+xml'
  }
}

export const XS_NS = 'http://www.w3.org/2001/XMLSchema'
export const XSI_NS = 'http://www.w3.org/2001/XMLSchema-instance'
export const WSDL_NS = 'http://schemas.xmlsoap.org/wsdl/'

export const XS_PREFIX = 'xsd'
export const XSI_PREFIX = 'xsi'
export const WSDL_PREFIX = 'wsdl'
export const SOAPENV_PREFIX = 'soapenv'
export const SOAPENC_PREFIX = 'soapenc'
export const SOAP_PREFIX = 'soap'

export const NODE_TYPES = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  ENTITY_REFERENCE_NODE: 5,
  ENTITY_NODE: 6,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
  NOTATION_NODE: 12
}

export default {
  SOAP,
  XS_NS,
  XSI_NS,
  WSDL_NS,
  XS_PREFIX,
  XSI_PREFIX,
  WSDL_PREFIX,
  SOAPENV_PREFIX,
  SOAPENC_PREFIX,
  SOAP_PREFIX,
  NODE_TYPES
}
