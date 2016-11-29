import chalk from 'chalk'
import VSphere from '../client/index'
import cred from '../../credentials'
let { host, username, password } = cred
import _ from 'lodash'

let token = '522f65d5-f468-def8-4278-2304966c4dc9'

let v = VSphere(host, { token, ignoreSSL: true })
// let v = VSphere(host, { username, password, ignoreSSL: true })

// console.log(v)

v.token().run().then((res) => {
  console.log(res)
  process.exit()
}).catch(console.error)
