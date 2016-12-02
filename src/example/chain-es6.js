import chalk from 'chalk'
import VSphere from '../index'
import cred from '../../credentials'
let { host, username, password } = cred
import _ from 'lodash'

let token = 'ac4e64f679aed6e4d63d937825ee4d3f7f330cc7'
let st = Date.now()

// let v = VSphere(host, { token, ignoreSSL: true })
let v = VSphere(host, { username, password, ignoreSSL: true })

// console.log(v)

// v.token().run().then((res) => {
v.retrieve({
  properties: ['name'],
  type: 'VirtualMachine',
  id: ['vm-16']
})
  .run()
  .then((res) => {
    console.log('Time:', (Date.now() - st) / 1000, 'seconds')
    console.log(JSON.stringify(res, null, '  '))
    return v.logout()
  })
  .catch(console.error)

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
