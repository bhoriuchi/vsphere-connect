import chalk from 'chalk'
import VSphere from '../srcOld/index'
import cred from '../../credentials'
let { host, username, password } = cred
import _ from 'lodash'

let token = 'ac4e64f679aed6e4d63d937825ee4d3f7f330cc7'
let st = Date.now()

// setTimeout(process.exit, 2000)

// let v = VSphere(host, { token, ignoreSSL: true })
let v = VSphere(host, {
  username,
  password,
  ignoreSSL: true,
  soapEvents: {
    response (obj) {
      // console.log(obj.body)
    }
  }
})

// console.log(v)

v.token().run().then(console.log, console.error)
/*
v.retrieve({
  properties: ['name', 'summary'],
  type: 'VirtualMachine',
  id: ['vm-16']
})
*/
/*
v.type('cluster').pluck('name', 'parent')
  .run()
  .then((res) => {
    console.log('Time:', (Date.now() - st) / 1000, 'seconds')
    console.log(JSON.stringify(res, null, '  '))
    return v.logout()
  })
  .catch(console.error)
*/
// factor out login and client setup time and get strictly query time
/*
setTimeout(() => {
  let st = Date.now()
  v.type('VirtualMachine')
    .run()
    .then((res) => {
      console.log('Time:', (Date.now() - st) / 1000, 'seconds')
      console.log(JSON.stringify(res, null, '  '))
      return v.logout()
    })
    .catch(console.error)
}, 2000)
*/

/*
v.createDatacenter('mydc100')
  .run()
  .then((res) => {
    console.log('Time:', (Date.now() - st) / 1000, 'seconds')
    console.log(JSON.stringify(res, null, '  '))
    return v.logout()
  })
  .catch(console.error)
  */