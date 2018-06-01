import _ from 'lodash';

export function nicTypeMapper(type) {
  switch (_.toLower(type)) {
    case 'vmxnet':
    case 'vmxnet3':
    case 'virtualvmxnet3':
      return 'VirtualVmxnet3';
    case 'vmxnet2':
    case 'virtualvmxnet2':
      return 'VirtualVmxnet2';
    case 'e1000':
    case 'virtuale1000':
      return 'VirtualE1000';
    case 'e1000e':
    case 'virtuale1000e':
      return 'VirtualE1000e';
    case 'pcnet32':
    case 'pcnet':
    case 'virtualpcnet32':
      return 'VirtualPCNet32';
    case 'sriov':
    case 'sriovethernetcard':
    case 'virtualsriovethernetcard':
      return 'VirtualSriovEthernetCard';
    default:
      return 'VirtualE1000';
  }
}

export function nicBackingMapper(networkType) {
  switch (_.toLower(networkType)) {
    case 'network':
      return 'VirtualEthernetCardNetworkBackingInfo';
    case 'distributedvirtualportgroup':
      return 'VirtualEthernetCardDistributedVirtualPortBackingInfo';
    default:
      return 'VirtualEthernetCardNetworkBackingInfo';
  }
}
