export default {
  description: 'Executes a vSphere method',
  usage: ['v.method(name, args) → Promise<any>'],
  example: {
    description: 'Destroy a VirtualMachine',
    code: `v.method('Destroy_Task', {
  _this: {
    type: 'VirtualMachine',
    value: 'vm-53'
  }
})`
  },
  params: {
    name: {
      type: 'String',
      description: 'The operation name',
      optional: false
    },
    args: {
      type: 'Object',
      description: 'The method arguments object',
      optional: false
    }
  }
}
