export default {
  description: 'Produce a single value from a sequence through repeated application of a reduction function. ' +
  'Behind the scenes this method uses <a href="http://bluebirdjs.com">Bluebird</a> ' +
  '<a href="http://bluebirdjs.com/docs/api/promise.reduce.html"><code>Promise.reduce</code></a>',
  usage: ['array.each(reducer(accumulator:any, item:any, index:int, length:int) [, initialValue])'],
  example: {
    description: 'Return the total virtual CPUs used by all vms',
    code: `v.type('vm')
  .pluck({
    guest: {
      hardware: {
        numCPU: true
      }
    }
  })
  .reduce((accum, vm) => {
    return accum + vm.guest.hardware.numCPU
  }, 0)`
  },
  params: {
    reducer: {
      type: 'Function',
      description: 'A function that will be called for each item in the result set along with the accumulator value, current index' +
      'and the length of the result set',
      optional: false
    },
    initialValue: {
      type: 'Any',
      description: 'An initial accumulator value',
      optional: true
    }
  }
}
