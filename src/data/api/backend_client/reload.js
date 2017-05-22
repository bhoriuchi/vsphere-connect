export default {
  description: 'Reloads a managed object',
  usage: ['client.reload(moRef) → Promise'],
  example: {
    description: 'Reload a managed object',
    code: `client.reload({
  type: 'vm',
  id: 'vm-10'
})`
  },
  params: {
    moRef: {
      type: 'Object',
      description: 'Object identifier hash',
      optional: false,
      fields: {
        type: {
          type: 'String',
          description: 'Managed object type',
          optional: true
        },
        id: {
          type: 'String',
          description: 'Managed object id',
          optional: true
        }
      }
    }
  }
}
