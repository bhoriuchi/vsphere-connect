import _ from 'lodash'
import VSphere from '../src/index'
import cred from '../credentials'
let { host, username, password } = cred

let v = VSphere(host, { ignoreSSL: true })
v =  v.login(username, password)
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