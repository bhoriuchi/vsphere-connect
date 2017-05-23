export default {
  description: 'Performs an object retrieval',
  usage: ['v.retrieve(args, [options]) → Promise<ManagedObject[]>'],
  example: {
    description: 'Retrieve a vm with some specific properties',
    code: `v.retrieve({
  type: 'vm',
  id: 'vm-10',
  properties: ['name', 'guest.guestState']
})`
  },
  params: {
    args: {
      type: 'Object',
      description: 'Retrieval parameters',
      optional: false,
      fields: {
        type: {
          type: 'String',
          description: 'Managed object type',
          optional: false
        },
        id: {
          type: 'String|String[]',
          description: 'Object id(s)',
          optional: true
        },
        properties: {
          type: 'String[]',
          description: 'Specific properties to get. A <code>null</code> value gets all properties',
          optional: true
        }
      }
    },
    options: {
      type: 'Object',
      description: 'Retrieval options',
      optional: true,
      fields: {
        limit: {
          type: 'Number',
          description: 'Limit the number of results',
          optional: true
        },
        skip: {
          type: 'Number',
          description: 'Skips the first n results',
          optional: true
        },
        nth: {
          type: 'Number',
          description: 'Gets the nth result and returns a single object',
          optional: true
        },
        resultHandler: {
          type: 'Function',
          description: 'A function that takes the results as its argument and who\'s value is returned',
          optional: true
        },
        orderBy: {
          type: 'Object',
          description: 'Order document, allows results to be ordered',
          optional: true
        }
      }
    }
  }
}
