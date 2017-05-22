export default {
  description: 'Renames a managed object',
  usage: ['client.rename(moRef, newName, [options]) → Promise<Task>'],
  example: {
    description: 'Rename a managed object',
    code: `client.rename({
  type: 'vm',
  id: 'vm-10'
}, 'vmrenamed01')`
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
    newName: {
      type: 'String',
      description: 'New name to set',
      optional: false
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
