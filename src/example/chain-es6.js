import chalk from 'chalk'
import VSphere from '../client/index'
import cred from '../../credentials'
let { host, username, password } = cred
import _ from 'lodash'

let token = '64966e12663dd7616e8ac44deac49aa9eba08de9'

let v = VSphere(host, { token, ignoreSSL: true })
// let v = VSphere(host, { username, password, ignoreSSL: true })

// console.log(v)

v.token().run().then((res) => {
  console.log(res)
  process.exit()
}).catch(console.error)
