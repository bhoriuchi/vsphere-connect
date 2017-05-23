export default {
  description: 'Create a new VConnect connection and return a top-level namespace',
  usage: ['VConnect(viserver, options) → v'],
  example: {
    description: 'Establish a client session',
    code: `import VConnect from 'vsphere-connect'
let v = VConnect('vcenter.mydomain.com')`
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
      optional: true,
      fields: {
        ignoreSSL: {
          type: 'Boolean',
          description: 'Disable SSL security checks',
          optional: true,
          default: false
        }
      }
    }
  },
  content: [
    {
      type: 'example',
      description: 'Access a self-signed viserver by ignoring invalid SSL',
      code: `let v = VConnect('vcenter01.mydomain.com', {
  ignoreSSL: true
})`
    }
  ]
}
