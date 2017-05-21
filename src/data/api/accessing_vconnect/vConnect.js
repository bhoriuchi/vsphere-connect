export default {
  description: 'Create a new VConnect connection and return a top-level namespace',
  usage: ['VConnect(viserver, options) → v'],
  example: {
    description: 'Establish a client session',
    code: `import VConnect from 'vsphere-connect'
let v = VConnect('vcenter.mydomain.com', {
  username: 'administrator@vsphere.local'
  password: 'vmware100'
})`
  },
  params: {
    viserver: {
      type: 'String',
      description: 'vCenter or ESXi host to connect to',
      optional: false
    },
    options: {
      type: 'Object',
      description: 'Connection options',
      optional: false,
      fields: {
        username: {
          type: 'String',
          description: 'User name for vSphere access',
          optional: true
        },
        password: {
          type: 'String',
          description: 'Password for vSphere access',
          optional: true
        },
        token: {
          type: 'String',
          description: 'Session token that can be used for authenticating',
          optional: true
        }
      }
    }
  }
}
