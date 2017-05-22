export default {
  description: 'Executes a vSphere method',
  usage: ['client.method(name, args) → Promise<*>'],
  example: {
    description: 'Destroy a VirtualMachine',
    code: `client.method('Destroy_Task', {
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
