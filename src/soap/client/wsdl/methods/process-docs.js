import _ from 'lodash'
import { getQName } from '../../utils/index'
import { XS_NS, WSDL_NS, SOAP } from '../../const'

// set operations via interface or portType
function setOperations (operations, portType) {
  _.forEach(portType.childNodes, node => {
    if (node.localName === 'operation') {
      operations[node.getAttribute('name')] = node
    }
  })
}

function processDoc (doc, data) {
  /*
   * PROCESS DEFINITIONS
   */
  const definitions = doc.getElementsByTagNameNS(WSDL_NS, 'definitions')
  _.forEach(definitions, defNode => {
    const ns = defNode.getAttribute('targetNamespace')
    const nsData = data[ns] = data[ns] || {}
    nsData.$prefix = _.findKey(defNode._nsMap, o => o === ns)
    nsData.actions = nsData.actions || {}
    nsData.messages = nsData.messages || {}
    nsData.operations = nsData.operations || {}
    nsData.ports = nsData.ports || {}

    _.forEach(defNode.childNodes, childNode => {
      switch (childNode.localName) {
        case 'binding':
          nsData.binding = childNode
          _.forEach(childNode.childNodes, bindingNode => {
            if (bindingNode.localName === 'operation') {
              const op = bindingNode.getAttribute('name')
              _.forEach(bindingNode.childNodes, node => {
                if (node.localName === 'operation') nsData.actions[op] = node
              })
            }
          })
          break
        case 'message':
          nsData.messages[childNode.getAttribute('name')] = childNode
          break
        case 'portType':
          setOperations(nsData.operations, childNode)
          break
        case 'interface':
          setOperations(nsData.operations, childNode)
          break
        case 'service':
          _.forEach(childNode.childNodes, node => {
            if (node.localName === 'port') {
              nsData.ports[node.getAttribute('name')] = node
              _.forEach(node.childNodes, child => {
                if (child.localName === 'address') {
                  const { prefix } = getQName(child.tagName || child.nodeName)
                  const soapNS = child.lookupNamespaceURI(prefix)
                  if (_.includes(_.keys(SOAP), soapNS)) {
                    node.$address = child.getAttribute('location')
                    node.$soapVersion = _.get(
                      SOAP,
                      `["${soapNS}"].version`, '1.1'
                    )
                  }
                }
              })
            }
          })
          break
      }
    })
  })

  /*
   * PROCESS SCHEMAS
   */
  const schemas = doc.getElementsByTagNameNS(XS_NS, 'schema')
  _.forEach(schemas, schemaNode => {
    const ns = schemaNode.getAttribute('targetNamespace')
    const nsData = data[ns] = data[ns] || {}
    nsData.attributes = nsData.attributes || {}
    nsData.types = nsData.types || {}
    nsData.elements = nsData.elements || {}
    nsData.attributeGroups = nsData.attributeGroups || {}

    _.forEach(schemaNode.childNodes, childNode => {
      switch (childNode.localName) {
        case 'attribute':
          nsData.attributes[childNode.getAttribute('name')] = childNode
          break
        case 'complexType':
        case 'simpleType':
          nsData.types[childNode.getAttribute('name')] = childNode
          break
        case 'element':
          const name = childNode.getAttribute('name')
          const el = nsData.elements[name] = childNode
          _.forEach(childNode.childNodes, node => {
            if (_.includes([ 'complexType', 'simpleType' ], node.localName)) {
              node.setAttribute('name', name)
              el.setAttribute('type', `${node.lookupPrefix(ns)}:${name}`)
              nsData.types[name] = node
            }
          })
          break
        case 'attributeGroup':
          nsData.attributeGroups[childNode.getAttribute('name')] = childNode
          break
      }
    })
  })
}

export default function processDocs (cache, data) {
  _.forEach(cache, doc => processDoc(doc, data))
}
