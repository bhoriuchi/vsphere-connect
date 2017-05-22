export default {
  description: 'Turn a request into a changefeed, an infinite stream of objects representing changes to the ' +
  'request\'s results during a configurable polling period. This command returns an ' +
  '<a href="https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md">RxJS Objservable</a>',
  usage: ['request.changes([options]) → Observable'],
  example: {
    description: 'Subscribe to changes to VirtualMachine resources',
    code: `v.type('vm').changes().subscribe(
  change => {
    console.log(change)
  },
  error => {
    console.error(error)
  },
  () => {
    console.log('complete')
  }
)`
  },
  params: {
    options: {
      type: 'Object',
      description: 'Changefeed options',
      optional: true,
      fields: {
        interval: {
          type: 'Number',
          description: 'Time in milliseconds between update requests',
          optional: true,
          default: 10000
        }
      }
    }
  },
  content: [
    {
      type: 'html',
      html: '<h4>A note on change frequency</h4>Because changefeeds use long polling requests to query the vSphere ' +
      'api for changes, it can sometimes ' +
      'be useful to modify the polling interval based on the amount of data being analyzed or the need for ' +
      'near realtime updates. Changefeeds allow you to accomplish this by specifying an update interval period. ' +
      'Updates that are requested before the previous update has completed will be disregarded.'
    },
    {
      type: 'example',
      description: 'Subscribe to changes on a specific Datacenter with a polling period of 500ms',
      code: `v.type('datacenter')
  .changes({ interval: 500 })
  .subscribe(
    change => {
      console.log(change)
    }
  )`
    }
  ]
}
