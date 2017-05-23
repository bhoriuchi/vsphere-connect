export default {
  description: 'Transform each element of a result set by applying a mapping function to it. ' +
  'Behind the scenes this method uses <a href="http://bluebirdjs.com">Bluebird</a> ' +
  '<a href="http://bluebirdjs.com/docs/api/promise.map.html"><code>Promise.map</code></a>',
  usage: [
    'array.map(mapper(item:any, index:int, length: int) [, options]) → array'
  ],
  example: {
    description: 'Return only the name and id for all vms',
    code: `v.type('vm')
  .map(vm => {
    return {
      id: vm.moRef.value,
      name: vm.name
    }
  })`
  },
  params: {
    mapper: {
      type: 'Function',
      description: 'A function that will be called for each item in the result set along with the current index ' +
      'and the length of the result set. The return value is mapped to the current index of the result set.',
      optional: false
    },
    options: {
      type: 'Object',
      description: 'See Bluebird documentation for ' +
      '<a href="http://bluebirdjs.com/docs/api/promise.map.html"><code>Promise.map</code></a>',
      optional: true
    }
  }
}
