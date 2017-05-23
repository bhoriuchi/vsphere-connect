export default {
  description: 'Sort a result set',
  usage: [
    'selection.orderBy(orderDocument) → selection',
    'array.orderBy(orderDocument) → array'
  ],
  example: {
    description: 'Order vms by name in ascending order',
    code: `v.type('vm')
  .orderBy({
    name: 1
  })`
  },
  params: {
    orderDocument: {
      type: 'Object',
      description: 'Document used to determine complex ordering. See full documentation.',
      optional: false
    }
  },
  content: [
    {
      type: 'html',
      html: `<h4>Order Document</h4>
The document is a simple single level object where the key is the field name to sort on and the 
value is <code>1</code> or <code>"asc"</code> for ascending sort and <code>-1</code> or <code>desc</code> for 
descending sort. The order of the keys is also used as prioritization for the sort.`
    },
    {
      type: 'example',
      description: 'The following will sort vms by ascending cpu count and descending memory size',
      code: `v.type('vm')
  .pluck({
    guest: {
      hardware: {
        memoryMB: true,
        numCPU: true
      }
    }
  })
  .map(vm => {
    return {
      name: vm.name,
      memory: vm.guest.hardware.memoryMB,
      cpu: vm.guest.hardware.numCPU
    }
  })
  .orderBy({
    cpu: 'asc',
    memory: 'desc'
  })`
    }
  ]
}
