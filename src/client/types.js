import _ from 'lodash'

export function getType (schemas, nsURI, name) {
  return _.get(schemas, `["${nsURI}"].complexTypes["${name}"]`) ||
    _.get(schemas, `["${nsURI}"].simpleTypes["${name}"]`) ||
    _.get(schemas, `["${nsURI}"].elements["${name}"]`)
}

export function setAttrs (obj, args, attrs) {
  _.forEach(attrs, (attr) => {
    let attrName = _.get(attr, 'qname.name')
    let attrVal = _.get(args, `$attributes["${attrName}"]`)
    if (attrVal) _.set(obj, `$attributes["${attrName}"]`, attrVal)
  })
}

export function getElementKeys (type) {
  return _.map(_.get(type, 'descriptor.elements'), (el) => {
    return el.name || el.$name || _.get(el, 'qname.name')
  })
}

export function buildType (schemas, type, obj) {
  let o = {}
  let els = type.elements || type.descriptor.elements
  let extension = _.get(type, 'descriptor.extension')


  if (extension && !extension.isSimple) {
    let ext = getType(schemas, extension.xmlns, extension.name)
    o = buildType(schemas, ext, obj)
  }

  if (!_.get(type, 'descriptor.isSimple', false)) {
    _.set(o, '$attributes.xsi:type', _.get(obj, '$attributes.xsi:type', type.$name))
  }

  if (els.length) {
    _.forEach(els, (el) => {
      let val = _.get(obj, `["${el.qname.name}"]`)
      let { nsURI, name } = el.type
      let t = getType(schemas, nsURI, name)
      let objKeys = !_.isArray(val) ? _.isObject(val) ? _.keys(val) : [] : _.reduce(val, (l, r) => {
        return _.isObject(r) && !_.isArray(r) ? _.union(l, _.keys(r)) : _.union(l, [])
      }, [])
      let elKeys = getElementKeys(t)
      let propMatch = _.intersection(objKeys, elKeys).length

      _.forEach(_.get(t, 'descriptor.inheritance'), ({ name, xmlns }) => {
        let curElType = getType(schemas, xmlns || nsURI, name)
        let curElKeys = getElementKeys(curElType)
        let curPropMatch = _.intersection(objKeys, curElKeys).length
        if (curPropMatch > propMatch) {
          propMatch = curPropMatch
          t = curElType
        }
      })

      if (val || val === false) {
        if (el.isMany) {
          if (_.isArray(val)) {
            o[el.qname.name] = _.map(val, (v) => {
              return el.isSimple ? v : buildType(schemas, t, v)
            })
            setAttrs (o[el.qname.name], val, el.attributes)
          }
        } else {
          o[el.qname.name] = el.isSimple ? val : buildType(schemas, t, val)
          setAttrs (o[el.qname.name], val, el.attributes)
        }
      }
    })
  }
  return o
}

export function buildMessage (wsdl, op, data) {
  let definitions = _.get(wsdl, 'definitions')
  let schemas = _.get(definitions, 'schemas')
  let operations = _.get(definitions, `portTypes.VimPortType.operations`)
  let msgType = _.get(operations, `["${op}"].input.message.parts.parameters.element.type`)

  return _.omit(buildType(schemas, msgType, data), ['$attributes'])
}

export default {
  buildMessage,
  buildType,
  setAttrs,
  getType
}