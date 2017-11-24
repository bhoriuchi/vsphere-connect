import _ from 'lodash'
import EventEmitter from 'events'
import methods from './methods/index'
import { getQName } from '../utils/index'
import Promise from 'bluebird'
import Store from '../../cache/index'

/*
 * Strategy adapted from vSphere JS SDK
 * https://labs.vmware.com/flings/vsphere-sdk-for-javascript#summary
 */

export class WSDL extends EventEmitter {
  constructor (address, options = {}, cacheKey) {
    super()
    this.cacheKey = cacheKey || address
    this.address = address
    this.options = options
    const data = {}

    _.forEach(methods, (method, name) => {
      this[name] = method.bind(this)
    })

    return new Promise((resolve, reject) => {
      const resolving = []
      const cache = {}
      const useCache = _.get(this.options, 'cache', true)

      if (useCache) {
        const rawMetadata = Store.get(this.cacheKey)
        if (rawMetadata) {
          this.metadata = JSON.parse(rawMetadata)
          return resolve(this)
        }
      }

      this.on('wsdl.load.error', reject)
      this.on('wsdl.load.start', doc => resolving.push(doc))
      this.on('wsdl.load.end', doc => {
        const idx = resolving.indexOf(doc)
        if (idx >= 0) resolving.splice(idx, 1)
        if (!resolving.length) {
          this.removeAllListeners()

          // process wsdl
          this.processDocs(cache, data)
          this.metadata = this.processDef(data)

          // store the metadata
          if (useCache) Store.set(this.cacheKey, JSON.stringify(this.metadata))

          // resolve the WSDL object
          return resolve(this)
        }
      })
      this.loadDoc(this.address, cache)
    })
  }

  getType (t) {
    const [ ns, type ] = t
    return _.get(this.metadata, `types[${ns}][${type}]`)
  }

  getTypeByLocalNSPrefix (nsPrefix, localName) {
    const nsIdx = _.findIndex(this.metadata.namespaces, { prefix: nsPrefix })
    const ns = _.get(this.metadata.namespaces, `[${nsIdx}]`)
    const typeIdx = ns.types.indexOf(localName)
    return [ nsIdx, typeIdx ]
  }

  getTypeByLocalNS (nsURI, localName) {
    const nsIdx = _.findIndex(this.metadata.namespaces, { name: nsURI })
    const ns = _.get(this.metadata.namespaces, `[${nsIdx}]`)
    const typeIdx = ns.types.indexOf(localName)
    return [ nsIdx, typeIdx ]
  }

  getTypeAttribute (node) {
    for (const key of Object.keys(node.attributes)) {
      const n = node.attributes[key]
      if (n.localName === 'type') {
        return n
      }
    }
  }

  getOp (o) {
    const [ ns, port, op ] = o
    return _.get(this.metadata, `operations[${ns}][${port}][${op}]`)
  }

  getTypeName (t) {
    const [ ns, type ] = t
    return _.get(this.metadata, `namespaces[${ns}].types[${type}]`)
  }

  getTypeRoot (t) {
    const root = this.getType(t).base
    return root ? this.getTypeRoot(root) : t
  }

  getNSPrefix (t) {
    const [ ns ] = t
    return _.get(this.metadata, `namespaces[${ns}].prefix`)
  }

  getNSURIByPrefix (prefix) {
    return _.get(_.find(this.metadata.namespaces, { prefix }), 'name')
  }

  getTypeByQName (qname, fallbackNSURI) {
    const { prefix, localName } = getQName(qname)
    const nsURI = prefix ? this.getNSURIByPrefix(prefix) : fallbackNSURI
    return this.getTypeByLocalNS(nsURI, localName)
  }

  isBuiltInType (t) {
    const [ ns ] = t
    return _.get(this.metadata, `namespaces[${ns}].isBuiltIn`) === true
  }

  isEnumType (t) {
    return _.has(this.getType(t), 'enumerations')
  }

  isSimpleType (t) {
    return this.isBuiltInType(t) || this.isEnumType(t)
  }

  isMany (typeDef) {
    if (!typeDef.maxOccurs) return false
    const maxOccurs = typeDef.maxOccurs === 'unbounded'
    ? 2
    : Number(maxOccurs)
    return maxOccurs > 1
  }

  isRequired (typeDef) {
    return Number(typeDef.minOccurs) > 0
  }

  convertValue (type, value) {
    if (this.isEnumType(type)) return value
    const t = this.getType(type)
    return t.convert ? t.convert(value) : value
  }
}

export default function (address, options = {}, cacheKey) {
  return new WSDL(address, options, cacheKey)
}
