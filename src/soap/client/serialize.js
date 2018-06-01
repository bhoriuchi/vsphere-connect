import _ from 'lodash';
import { XSI_PREFIX } from './const';

function getExtProps(wsdl, type, ext = {}) {
  _.forEach(type.extendedBy, extType => {
    const name = wsdl.getTypeName(extType);
    const typeInfo = wsdl.getType(extType);
    if (!_.has(ext, `["${name}"]`)) {
      ext[name] = {
        type: extType,
        props: _.union(
          _.map(typeInfo.elements, 'name'),
          _.map(typeInfo.attributes, 'name'),
        ),
      };
      getExtProps(wsdl, typeInfo, ext);
    }
  });
  return ext;
}

function typeMatch(wsdl, type, data) {
  // check for an explicitly defined type and return
  // it if found and remove it from the object
  const explicitType = _.get(data, `["@${XSI_PREFIX}:type"]`);
  if (_.isString(explicitType) && explicitType.indexOf(':') !== -1) {
    delete data[`@${XSI_PREFIX}:type`]; // remove from the object
    const [nsPrefix, localName] = explicitType.split(':');
    return wsdl.getTypeByLocalNSPrefix(nsPrefix, localName);
  }

  // otherwise look for the best match
  let bestMatch = type;
  const info = wsdl.getType(type);
  const props = _.union(
    _.map(info.elements, 'name'),
    _.map(info.attributes, 'name'),
  );
  const dataKeys = _.keys(data);
  let inter = _.intersection(props, dataKeys).length;
  if (inter === dataKeys.length) return bestMatch;
  const ext = getExtProps(wsdl, info);

  _.forEach(ext, e => {
    const currentInter = _.intersection(e.props, dataKeys).length;
    if (currentInter > inter) {
      inter = currentInter;
      bestMatch = e.type;
    }
  });

  return bestMatch;
}

export default function serialize(wsdl, typeCoord, data, context = {}) {
  const { parentType, nsUsed: _nsUsed } = context;
  let obj = {};
  const prefix = wsdl.getNSPrefix(typeCoord);
  const type = wsdl.getType(typeCoord);
  const base = type.base;
  const nsUsed = _nsUsed ? _.union(_nsUsed, [prefix]) : [prefix];

  if (base) {
    obj = !wsdl.isBuiltInType(base)
      ? serialize(wsdl, base, data, context).obj
      : { '#text': data.value };
  }

  // set element values
  _.forEach(type.elements, el => {
    if (el.name && el.type) {
      const val = _.get(data, `["${el.name}"]`);
      if (val !== undefined) {
        if (wsdl.isMany(el)) {
          if (_.isArray(val)) {
            obj[`${prefix}:${el.name}`] = _.map(val, v => {
              const t = typeMatch(wsdl, el.type, v);
              const typeName = wsdl.getTypeName(t);
              const typePrefix = wsdl.getNSPrefix(t);
              const isSimple = wsdl.isSimpleType(t);

              return isSimple
                ? wsdl.convertValue(t, v)
                : serialize(wsdl, t, v, {
                    parentType: [typePrefix, typeName].join(':'),
                    nsUsed,
                  }).obj;
            });
          }
        } else {
          const t = typeMatch(wsdl, el.type, val);
          const typeName = wsdl.getTypeName(t);
          const typePrefix = wsdl.getNSPrefix(t);
          const isSimple = wsdl.isSimpleType(t);

          obj[`${prefix}:${el.name}`] = isSimple
            ? wsdl.convertValue(t, val)
            : serialize(wsdl, t, val, {
                parentType: [typePrefix, typeName].join(':'),
                nsUsed,
              }).obj;
        }
      }
    }
  });

  // set attributes
  _.forEach(type.attributes, attr => {
    if (attr.name) {
      let val = _.get(data, `["${attr.name}"]`);
      if (val !== undefined) {
        if (attr.type && wsdl.isSimpleType(attr.type)) {
          val = wsdl.convertValue(attr.type, val);
        }
        obj[`@${attr.name}`] = val;
      }
    }
  });
  if (!obj[`@${XSI_PREFIX}:type`] && parentType) {
    obj[`@${XSI_PREFIX}:type`] = parentType;
  }
  return { obj, nsUsed };
}
