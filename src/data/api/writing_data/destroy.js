export default {
  description: 'Destroys one or more managed objects. vSphere returns a <code>Task</code> reference. ' +
  'When using <code>async=false</code>, a monitor will be placed on the task that will resolve after ' +
  'the task either fails or succeeds.',
  usage: [
    'type.destroy([options]) → Promise<Task>',
    'selection.destroy([options]) → Promise<Task>',
    'singleSelection.destroy([options]) → Promise<Task>'
  ],
  example: {
    description: 'Destroy a virtual machine.',
    code: `v.type('vm')
  .get('vm-20')
  .destroy()`
  },
  params: {
    options: {
      type: 'Object',
      description: 'Destroy options',
      optional: true,
      fields: {
        async: {
          type: 'Boolean',
          description: 'When <code>false</code> destroy synchronously',
          optional: true,
          default: true
        }
      }
    }
  }
}
