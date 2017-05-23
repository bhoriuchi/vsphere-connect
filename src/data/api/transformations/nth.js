export default {
  description: 'Get the nth element of a sequence, counting from zero. ' +
  'If the argument is negative, count from the last element.',
  usage: [
    'sequence.nth(index) → object',
    'array.nth(index) → object'
  ],
  example: {
    description: 'Get the 10th result',
    code: `v.type('vm').nth(9)`
  },
  params: {
    index: {
      type: 'Number',
      description: 'index to select',
      optional: false
    }
  }
}
