import _ from 'lodash'
import url from 'url'
import { XS_NS, WSDL_NS, NODE_TYPES } from '../const'
const { ELEMENT_NODE } = NODE_TYPES

export function getQName (qname, pfx = '') {
  const [ prefix, localName ] = qname.split(':')
  return localName
    ? { [`${pfx}prefix`]: prefix, [`${pfx}localName`]: localName }
    : { [`${pfx}prefix`]: '', [`${pfx}localName`]: prefix }
}

export function firstNode (nodes) {
  return _.get(nodes, '0')
}

export function filterEmpty (obj) {
  return _.omitBy(obj, val => {
    if (_.isArray(val) && !val.length) return true
    if (!val && val !== false) return true
  })
}

export function getOperationElement (data, node) {
  const { mprefix, mlocalName } = getQName(node.getAttribute('message'), 'm')
  const msgNS = node.lookupNamespaceURI(mprefix)
  const msg = _.get(data, `["${msgNS}"].messages["${mlocalName}"]`)
  const part = _.first(msg.getElementsByTagNameNS(WSDL_NS, 'part'))
  const { eprefix, elocalName } = getQName(part.getAttribute('element'), 'e')
  const elNS = node.lookupNamespaceURI(eprefix)
  const el = _.get(data, `["${elNS}"].elements["${elocalName}"]`)
  return el
}

export function parseRef (namespaces, node, ref) {
  const { prefix, localName } = getQName(ref)
  const namespace = prefix
    ? node.lookupNamespaceURI(prefix)
    : node.namespaceURI || XS_NS
  let nsIdx = _.findIndex(namespaces, { name: namespace })
  let typeIdx = namespaces[nsIdx].types.indexOf(localName)

  // if not found, look through other namespaces
  if (typeIdx === -1) {
    _.forEach(namespaces, (n, idx) => {
      typeIdx = n.types.indexOf(localName)
      if (typeIdx !== -1) {
        nsIdx = idx
        return false
      }
    })
  }
  return [ nsIdx, typeIdx ]
}

export function toProperty (namespaces, node, data) {
  const obj = {}
  _.forEach(node.attributes, attr => {
    const name = attr.name
    const value = attr.value
    if (name === 'ref') {
      const { prefix, localName } = getQName(value)
      const elNSURI = node.lookupNamespaceURI(prefix)
      const ref = _.get(data, `["${elNSURI}"].elements["${localName}"]`)
      if (ref) {
        obj.name = ref.getAttribute('name')
        obj.type = parseRef(namespaces, ref, ref.getAttribute('type'))
      }
    } else if (name === 'type') {
      obj.type = parseRef(namespaces, node, value)
    } else {
      obj[name] = value
    }
  })
  return obj
}

export function getNodeData (node) {
  return _.get(node, 'firstChild.data') || _.get(node, 'firstChild.nodeValue')
}

export function getEndpointFromPort (client, port) {
  const svcURL = url.parse(port.address)
  if (svcURL.host.match(/localhost/i)) svcURL.host = client.options.endpoint
  return url.format(svcURL)
}

export function getFirstChildElement (node) {
  for (const key of Object.keys(node.childNodes)) {
    const n = node.childNodes[key]
    if (n.nodeType === ELEMENT_NODE) {
      return n
    }
  }
}

export default {
  getEndpointFromPort,
  getFirstChildElement,
  getNodeData,
  getOperationElement,
  firstNode,
  filterEmpty,
  parseRef,
  toProperty,
  getQName
}
