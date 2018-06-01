import _ from 'lodash';

export default function deserialize(wsdl, type, node, context = {}) {
  if (!node.textContent) return undefined;
  const { xsiPrefix, ignoreXSI } = context;
  const xsiType = node.getAttribute(`${xsiPrefix}:type`);
  const _type =
    xsiType && !ignoreXSI
      ? wsdl.getTypeByQName(xsiType, node.namespaceURI)
      : type;

  const typeDef = wsdl.getType(_type);
  const typeIsMany = wsdl.isMany(typeDef);
  let obj = typeIsMany ? [] : {};

  if (typeDef.base) {
    if (wsdl.isBuiltInType(typeDef.base)) {
      obj = { value: wsdl.convertValue(typeDef.base, node.textContent) };
    } else {
      obj = deserialize(
        wsdl,
        typeDef.base,
        node,
        _.merge(context, { ignoreXSI: true }),
      );
    }
  }

  if (wsdl.isSimpleType(_type)) {
    return wsdl.convertValue(_type, node.textContent);
  }
  _.forEach(typeDef.elements, el => {
    const isMany = wsdl.isMany(el) || typeIsMany;
    if (isMany && !typeIsMany && el.name) obj[el.name] = [];

    _.forEach(node.childNodes, childNode => {
      if (childNode.localName === el.name) {
        const o = deserialize(
          wsdl,
          el.type,
          childNode,
          _.merge(context, { ignoreXSI: false }),
        );
        if (o !== undefined) {
          if (isMany) {
            if (typeIsMany) obj.push(o);
            else obj[el.name].push(o);
          } else {
            obj[el.name] = o;
          }
        }
      }
    });
  });
  _.forEach(typeDef.attributes, attr => {
    const { name, type: attrType } = attr;
    if (name && attrType) {
      const val = node.getAttribute(name);
      if (val) obj[name] = wsdl.convertValue(attrType, val);
    }
  });
  return obj;
}
