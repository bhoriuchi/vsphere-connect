export default {
  description: 'Destroys a managed object',
  usage: ['client.destroy(moRef, [options]) → Task'],
  example: {
    description: 'Destroy a managed object',
    code: `client.destroy({
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
    },
    options: {
      type: 'Object',
      description: 'Destroy options',
      optional: true,
      fields: {
        'async=true': {
          type: 'Boolean',
          description: 'When false, synchronously wait for task to complete',
          optional: true
        }
      }
    }
  }
}
