export default {
  description: 'Turn a request into a changefeed, an infinite stream of objects representing changes to the request\'s results during a configurable polling period',
  usage: 'request.changes([options]) → stream',
  example: {
    description: 'Subscribe to changes to VirtualMachine resources',
    code: `v.type('vm').changes().then(cursor => {
  cursor.each((error, change) => {
    if (error) {
      console.error(error)
      return cursor.close()
    }
    console.log(change)
  })    
})`
  }
}
