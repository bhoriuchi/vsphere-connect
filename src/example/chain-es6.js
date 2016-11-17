import chalk from 'chalk'
import VSphere from '../client/index'
import cred from '../../credentials'
let { host, username, password } = cred
import _ from 'lodash'

let v = VSphere(host, { username, password, ignoreSSL: true })

// console.log(v)

v.logout().run().then((res) => {
  console.log(res)
  process.exit()
}).catch(console.error)
