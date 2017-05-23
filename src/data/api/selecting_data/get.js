export default {
  description: 'Get one or more managed objects by id',
  usage: [
    'type.get(id) → object',
    'type.get(id1, id2 [, ...]) → array'
  ],
  example: {
    description: 'Get a specific vm',
    code: `v.type('vm').get('vm-10')`
  },
  content: [
    {
      type: 'example',
      description: 'Get 3 vms',
      code: `v.type('vm').get('vm-22', 'vm-600', 'vm-245')`
    }
  ]
}
