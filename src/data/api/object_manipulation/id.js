export default {
  description: 'Select the id value of the current result',
  usage: [
    'object.id() → string',
    'array.id() → array'
  ],
  example: {
    description: 'Get the ids for all hosts',
    code: `v.type('host').id()`
  }
}
