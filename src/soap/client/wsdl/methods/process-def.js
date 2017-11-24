import _ from 'lodash'
import { XS_NS, WSDL_NS } from '../../const'
import { getBuiltinNSMeta } from '../namespaces/index'
import {
  toProperty,
  parseRef,
  filterEmpty,
  getQName,
  getOperationElement
} from '../../utils/index'

function getTypes (data, namespaces, types) {
  return _.map(types, type => {
    let maxOccurs = null
    let minOccurs = null
    let base
    const attributes = []
    const elements = []
    const enumerations = []
    const unions = []

    _.forEach(type.childNodes, node => {
      switch (node.localName) {
        case 'sequence':
        case 'choice':
        case 'all':
          maxOccurs = node.getAttribute('maxOccurs') || maxOccurs
          minOccurs = node.getAttribute('minOccurs') || minOccurs
      }
    })

    // process XSD elements
    _.forEach(type.getElementsByTagNameNS(XS_NS, 'element'), node => {
      const el = toProperty(namespaces, node, data)
      if (node.parentNode.localName === 'choice') {
        el.minOccurs = '0'
        maxOccurs = node.parentNode.getAttribute('maxOccurs') || maxOccurs
      }
      elements.push(el)
    })

    // process XSD anys
    _.forEach(type.getElementsByTagNameNS(XS_NS, 'any'), node => {
      elements.push(toProperty(namespaces, node, data))
    })

    // process attributes
    _.forEach(type.getElementsByTagNameNS(XS_NS, 'attribute'), node => {
      attributes.push(toProperty(namespaces, node, data))
    })

    // process anyAttributes
    _.forEach(type.getElementsByTagNameNS(XS_NS, 'anyAttribute'), node => {
      attributes.push(toProperty(namespaces, node, data))
    })

    // process attributeGroup
    _.forEach(type.getElementsByTagNameNS(XS_NS, 'attributeGroup'), node => {
      const { prefix, localName } = getQName(node.getAttribute('ref'))
      const groupNSURI = node.lookupNamespaceURI(prefix)
      const attrGroup = _.get(
        data,
        `["${groupNSURI}"].attributeGroups`,
        localName
      )
      _.forEach(
        attrGroup.getElementsByTagNameNS(XS_NS, 'attribute'),
        _node => {
          attributes.push(toProperty(namespaces, _node, data))
        }
    )
      _.forEach(
        attrGroup.getElementsByTagNameNS(XS_NS, 'anyAttribute'),
        _node => {
          attributes.push(toProperty(namespaces, _node, data))
        }
      )
    })

    // process extension
    const extension = _.get(
      type.getElementsByTagNameNS(XS_NS, 'extension'),
      '[0]',
      {}
    )
    if (_.isFunction(extension.getAttribute)) {
      base = parseRef(namespaces, extension, extension.getAttribute('base'))
    }

    // process enums
    if (type.localName === 'simpleType') {
      _.forEach(type.getElementsByTagNameNS(XS_NS, 'restriction'), node => {
        _.forEach(node.getElementsByTagNameNS(XS_NS, 'enumeration'), e => {
          enumerations.push(e.getAttribute('value'))
        })
      })
      _.forEach(type.getElementsByTagNameNS(XS_NS, 'union'), node => {
        _.forEach(
          type.getElementsByTagNameNS(XS_NS, 'memberTypes').split(/\s+/g),
          t => {
            unions.push(parseRef(namespaces, node, t))
          }
        )
      })
    }
    return filterEmpty({
      attributes,
      base,
      elements,
      enumerations,
      maxOccurs,
      minOccurs,
      unions
    })
  })
}

function getPortOperations (data, namespace, port) {
  const { prefix } = getQName(port.getAttribute('binding'))
  const bindingNS = prefix ? port.lookupNamespaceURI(prefix) : namespace
  const binding = _.get(data, `["${bindingNS}"].binding`)
  if (!binding) return []
  return _.map(
    binding.getElementsByTagNameNS(binding.namespaceURI, 'operation'),
    op => {
      return op.getAttribute('name')
    }
  )
}

function getPorts (data, namespace, def) {
  return _.map(def.ports, (port, name) => {
    return {
      name,
      address: port.$address,
      soapVersion: port.$soapVersion,
      service: port.parentNode.getAttribute('name'),
      operations: getPortOperations(data, namespace, port)
    }
  })
}

export default function processDef (data) {
  const operations = []
  const services = []
  const types = []
  const namespaces = getBuiltinNSMeta()

  // add empty array objects for each builtin type
  // to keep indexes in sync
  _.forEach(namespaces, ns => {
    ns.isBuiltIn = true
    operations.push([])
    services.push([])
    types.push([])
  })

  // get types and operations by namespace
  _.forEach(data, (def, name) => {
    namespaces.push({
      name,
      prefix: def.$prefix,
      ports: getPorts(data, name, def),
      services: [],
      types: _.keys(def.types)
    })
  })

  // add types
  _.forEach(data, def => types.push(getTypes(data, namespaces, def.types)))

  // add operations
  _.forEach(data, def => {
    const ops = []
    if (_.keys(def.ports).length) {
      _.forEach(def.ports, port => {
        const pOps = []
        const { prefix } = getQName(port.getAttribute('binding'))
        const portNS = port.lookupNamespaceURI(prefix)
        const binding = _.get(data, `["${portNS}"].binding`)
        const portOps = _.map(
          binding.getElementsByTagNameNS(binding.namespaceURI, 'operation'),
          op => {
            return op.getAttribute('name')
          }
        )
        _.forEach(portOps, name => {
          const node = _.get(data, `["${portNS}"].operations["${name}"]`)
          const input = getOperationElement(
            data,
            _.first(node.getElementsByTagNameNS(WSDL_NS, 'input'))
          )
          const output = getOperationElement(
            data,
            _.first(node.getElementsByTagNameNS(WSDL_NS, 'output'))
          )
          pOps.push([
            {
              action: _.get(data, `["${portNS}"].actions["${name}"]`)
                .getAttribute('soapAction'),
              name: input.getAttribute('name'),
              type: parseRef(namespaces, input, input.getAttribute('type'))
            },
            {
              type: parseRef(namespaces, output, output.getAttribute('type'))
            }
          ])
        })
        ops.push(pOps)
      })
    }
    operations.push(ops)
  })
  return { namespaces, operations, services, types }
}
