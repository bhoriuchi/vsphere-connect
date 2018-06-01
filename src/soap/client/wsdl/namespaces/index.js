import _ from 'lodash';
import xsd10 from './xsd1.0';

const NAMESPACES = {
  'http://www.w3.org/2001/XMLSchema': xsd10,
};

export function getBuiltinNSMeta() {
  return _.map(NAMESPACES, (ns, name) => {
    return {
      name,
      operations: [],
      services: [],
      types: _.keys(ns),
    };
  });
}

export default NAMESPACES;
