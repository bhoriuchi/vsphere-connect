export default {
  description: 'Iterate over a result set and pass each result to a callback function. Behind the scenes this ' +
  'method uses <a href="http://bluebirdjs.com">Bluebird</a> ' +
  '<a href="http://bluebirdjs.com/docs/api/promise.each.html"><code>Promise.each</code></a>',
  usage: ['array.each(callback(item:any, index:int, length:int))'],
  example: {
    description: 'Rename each vm in a list using incrementing numbers',
    code: `v.type('vm')
  .get('vm-100', 'vm-167', 'vm-23')
  .each((vm, index) => {
    let id = v.expr(vm).id()
    return v.type('vm').get(id).rename('myvm' + index)
  })`
  },
  params: {
    callback: {
      type: 'Function',
      description: 'A function that will be called for each item in the result set along with the current index' +
      'and the length of the result set',
      optional: false
    }
  }
}
