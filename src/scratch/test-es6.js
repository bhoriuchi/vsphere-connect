import _ from 'lodash'
import VSphere from '../index'
import cred from '../../credentials'
let { host, username, password } = cred

let v = VSphere(host, {
  username,
  password,
  ignoreSSL: true
})

/*
let vmr = v.type('vm').pluck({
  name: true,
  id: true
})
  .getAll('vm-15', 'vm-16')
  .do(results => {
    console.log('results are in', { results })
    return { stuff: true }
  })
*/
/*
let vmr = v.do(
  v.type('vm').pluck('name').get('vm-15'),
  v.type('vm').pluck('name').get('vm-16'),
  (vm1, vm2) => {
    return { vm1, vm2 }
  }
)
*/
let vmr = v.type('vm')
  .get('vm-15')
  .value('moRef.value')
  .do(val => {
    return v.branch(
      v.expr(val).eq('vm-15'),
      () => {
        console.log('exec1')
        return v.expr('its 15')
      },
      () => {
        console.log('exec2')
        return 'its something else'
      }
    )
  })


vmr.then(vms => {
  console.log(JSON.stringify(vms, null, '  '))
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