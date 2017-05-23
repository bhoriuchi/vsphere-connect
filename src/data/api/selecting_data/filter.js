export default {
  description: 'Return all the elements in a sequence for which the given predicate is true. The ' +
  'return value of <code>filter</code> will be the same as the input (sequence, stream, or array). ' +
  'Documents can be filtered in a variety of ways—ranges, nested values, boolean conditions, and the ' +
  'results of anonymous functions.' +
  'Behind the scenes this method uses <a href="http://bluebirdjs.com">Bluebird</a> ' +
  '<a href="http://bluebirdjs.com/docs/api/promise.filter.html"><code>Promise.filter</code></a>',
  usage: [
    'array.filter(filterer(value:any, index:int, length: int) [, options]) → array'
  ],
  example: {
    description: 'Return all vms who\'s name matches test',
    code: `v.type('vm')
  .filter(vm => {
    return vm.name.match(/test/i) !== null
  })`
  },
  params: {
    filterer: {
      type: 'Function',
      description: 'A function that will be called for each item in the result set along with the current index ' +
      'and the length of the result set. If the return value is <code>true</code> the item will be added to the ' +
      'result set',
      optional: false
    },
    options: {
      type: 'Object',
      description: 'See Bluebird documentation for ' +
      '<a href="http://bluebirdjs.com/docs/api/promise.filter.html"><code>Promise.filter</code></a>',
      optional: true
    }
  }
}
