export default {
  description: 'Create a new VConnect connection and return a top-level namespace',
  usage: 'VConnect(viserver, options) → v',
  example: {
    description: 'Establish a client session',
    code: `import VConnect from 'vsphere-connect'
let v = VConnect('vcenter.mydomain.com', {
  username: 'administrator@vsphere.local'
  password: 'vmware100'
})`
  }
}
