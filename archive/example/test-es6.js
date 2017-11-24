import _ from 'lodash'
import VSphere from '../src/index'
import cred from '../credentials'
let { host, username, password } = cred

let v = VSphere(host, { ignoreSSL: true })

v =  v.login(username, password)

/*
v.moRef('/Phoenix/network/350').then(console.log, console.error)
  .then(() => {
    return v.logout()
  })

*/


v.type('vm')
  .create('/Phoenix/vm', spec => {
    spec.name('testbuilder1')
      .pool('Lab/Resources/Dev')
      .memory('2gb')
      .cpus(4)
      .addNic('350', 'vmxnet3')
      .addNic('VM Network', 'e1000')
  })
  .then(res => {
    console.log(JSON.stringify(res, null, '  '))
  }, console.error)
  .then(() => v.logout())
  .catch(console.error)

/*
v.createClient(client => {
  return client.serviceContent
  // console.log(client.createSpec())
})
  .then(sc => console.log(JSON.stringify(sc, null, '  ')), console.error)
  */
/*
v =  v.login(username, password)

v.type('vm')
  .pluck('name')
  .get('vm-85')
  .then(res => {
    console.log(JSON.stringify(res, null, '  '))
  }, console.error)
  .then(() => v.logout())
  .catch(console.error)
*/


/*
v.type('datacenter').changes().subscribe(
  change => {
    console.log(change)
  },
  error => {
    console.error(error)
  },
  () => {
    console.log('complete')
  }
)
*/