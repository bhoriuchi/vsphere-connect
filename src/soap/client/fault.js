import deserialize from './deserialize';
import { firstNode, getNodeData, getFirstChildElement } from './utils/index';

export default function processFault(wsdl, fault, context) {
  const faultCode = getNodeData(
    firstNode(fault.getElementsByTagName('faultcode')),
  );
  const faultString = getNodeData(
    firstNode(fault.getElementsByTagName('faultstring')),
  );
  const faultNode = getFirstChildElement(
    firstNode(fault.getElementsByTagName('detail')),
  );
  const typeAttr = wsdl.getTypeAttribute(faultNode);
  const faultTypeName =
    typeAttr.value || typeAttr.nodeValue || faultNode.localName;
  const faultType = wsdl.getTypeByLocalNS(
    faultNode.namespaceURI,
    faultTypeName,
  );

  return {
    faultCode,
    message: faultString,
    type: faultTypeName,
    detail: deserialize(wsdl, faultType, faultNode, context),
  };
}
