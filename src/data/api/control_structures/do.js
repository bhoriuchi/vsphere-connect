export default {
  description: 'Call an anonymous function using return values from other vConnect commands or queries ' +
  'as arguments.' +
  '<br><br>' +
  'The last argument to <code>do</code> (or, in some forms, the only argument) ' +
  'is an expression or an anonymous function which receives values from either the previous arguments or ' +
  'from prefixed commands chained before <code>do</code>. The <code>do</code> command is essentially ' +
  'a single-element map, letting you map a function over just one object. This allows you to bind a request result ' +
  'to a local variable within the scope of <code>do</code>, letting you compute the result just once and reuse ' +
  'it in a complex expression or in a series of vConnect commands.',
  usage: [
    'any.do(function) → any',
    'v.do([args]*, function) → any',
    'any.do(expr) → any',
    'v.do([args]*, expr) → any'
  ],
  example: {
    description: 'Combine 2 vms into a custom object',
    code: `v.do(
  v.type('vm').get('vm-10'),
  v.type('vm').get('vm-502'),
  (vm1, vm2) => {
    return { vm1, vm2 }
  }
)`
  },
  content: [
    {
      type: 'example',
      description: 'Get the host a specific vm is running on',
      code: `v.type('vm')
  .pluck('runtime.host')
  .get('vm-621')
  .do(vm => {
    return v.type('host')
      .get(vm.runtime.host)
  })`
    }
  ]
}
