export default {
  description: 'Select a value from the result or sequence',
  usage: [
    'sequence(attr) → sequence',
    'object(attr) → value',
    'sequence.value(path) → sequence',
    'object.value(path) → value'
  ],
  example: {
    description: 'Get a vm name',
    code: `v.type('vm').get('vm-10')('name')`
  },
  params: {
    attr: {
      type: 'String',
      description: 'Attribute name for the current object',
      optional: false
    },
    path: {
      type: 'String',
      description: 'Path string for the current object',
      optional: false
    }
  },
  content: [
    {
      type: 'example',
      description: 'Select the guestFamily for all vms',
      code: `v.type('vm')
  .pluck('guest.guestFamily')
  .value('guest.guestFamily')`
    }
  ]
}
