export default {
  description: 'Skip a number of elements from the head of the result set.',
  usage: [
    'selection.skip(n) → selection',
    'array.skip(n) → array'
  ],
  example: {
    description: 'Skip 10 results',
    code: `v.type('vm').skip(10)`
  },
  params: {
    n: {
      type: 'Number',
      description: 'number of results to skip',
      optional: false
    }
  }
}
