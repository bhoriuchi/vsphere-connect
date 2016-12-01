import chalk from 'chalk'
import VSphere from '../client/index'
import cred from '../../credentials'
let { host, username, password } = cred
import _ from 'lodash'

let token = 'ac4e64f679aed6e4d63d937825ee4d3f7f330cc7'

let v = VSphere(host, { token, ignoreSSL: true })
// let v = VSphere(host, { username, password, ignoreSSL: true })

// console.log(v)

// v.token().run().then((res) => {
v.retrieve({ type: 'VirtualMachine', properties: ['name'] }).run().then((res) => {
  console.log(res)
  process.exit()
}).catch(console.error)
