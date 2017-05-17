import VSphere from '../index'
import cred from '../../credentials'
let { host, username, password } = cred

let v = VSphere(host, {
  username,
  password,
  ignoreSSL: true
})

let vmr = v.type('vm').pluck({
  name: true,
  summary: {
    overallStatus: true
  }
}).orderBy({
  name: 1
})

vmr.then(vms => {
  console.log({vms})
  // return vmr.pluck('name')
})
  /*
  .then(res => {
    console.log({res})
    return vmr.pluck('summary')
  })
  .then(res2 => {
    console.log({res2})
  })
  */
  .then(() => {
    return v.logout()
  })
  .catch(console.error)