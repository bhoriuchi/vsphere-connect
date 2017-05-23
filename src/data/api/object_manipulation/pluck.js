export default {
  description: 'Plucks out one or more attributes from either an object or a sequence of object. ' +
  'The <code>pluck</code> command is especially important when selecting data because by default only the name ' +
  'and moRef are returned. When using <code>pluck</code>, all of the selector fields will also be requested in the ' +
  'retrieval process making them available in the result set.',
  usage: [
    'selection.pluck(selector1 [, selector2...]) → selection',
    'array.pluck(selector1 [, selector2...]) → array',
    'object.pluck(selector1 [, selector2...]) → object'
  ],
  example: {
    description: 'Pluck the name and guestState from all vms',
    code: `v.type('vm')
  .pluck('name', 'guest.guestState')`
  },
  content: [
    {
      type: 'html',
      html: `<h4>Selector</h4>
A selector can be a document or string. The end goal of a selector is to construct a path string that can be used 
in the retrieval process. Documents will be parsed into a path string and should take the form of the object path 
where the final property's value is true`
    },
    {
      type: 'example',
      description: 'Get the cpu and memory data using a document selector',
      code: `v.type('vm')
  .pluck({
    guest: {
      hardware: {
        memoryMB: true,
        numCPU: true
      }
    }
  })`
    }
  ]
}
