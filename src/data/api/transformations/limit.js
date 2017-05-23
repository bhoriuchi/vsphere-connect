export default {
  description: 'End the sequence after the given number of results.',
  usage: [
    'selection.limit(n) → selection',
    'array.limit(n) → array'
  ],
  example: {
    description: 'Get the first 10 vms',
    code: `v.type('vm').limit(10)`
  },
  params: {
    n: {
      type: 'Number',
      description: 'number of results to limit',
      optional: false
    }
  }
}
