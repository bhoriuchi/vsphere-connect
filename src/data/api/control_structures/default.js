export default {
  description: 'Provide a <code>default</code> value in case of non-existence errors. The default command ' +
  'evaluates its first argument (the value it’s chained to). If that argument returns <code>null</code> or a ' +
  'non-existence error is thrown in evaluation, then <code>default</code> returns its second argument. ' +
  'The second argument is usually a default value, but it can be a function that returns a value.',
  usage: [
    'value.default(default_value | function) → any',
    'sequence.default(default_value | function) → any'
  ],
  example: {
    description: 'Set a default value for an unknown property',
    code: `v.type('vm')
  .get('vm-227')('guest')('powerState')
  .default('unknown')`
  }
}
