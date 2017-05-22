export default {
  description: 'Destroys a Managed Object',
  usage: ['client.destroy(args, [options]) → Task'],
  example: {
    description: 'Destroy a managed object',
    code: `client.destroy({
  type: 'vm',
  id: 'vm-10'
})`
  },
  params: {
    args: {
      type: 'Object',
      description: 'Object identifier hash',
      optional: false,
      fields: {
        type: {
          type: 'String',
          description: 'Managed Object type',
          optional: true
        },
        id: {
          type: 'String',
          description: 'Managed Object id',
          optional: true
        },
        moRef: {
          type: 'ManagedObjectReference',
          description: 'ManagedObjectReference to the object',
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
