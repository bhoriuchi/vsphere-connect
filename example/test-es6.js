import _ from 'lodash'
import VSphere from '../src/index'
import cred from '../credentials'
let { host, username, password } = cred

let v = VSphere(host, { ignoreSSL: true })
  .login(username, password).type('vm')

v.do(v.type('vm').get('vm-16'), v.type('vm').get('vm-15'), (vm1, vm2) => {
  return { vm1, vm2 }
})
  .then(console.log, console.error)

/*
v.expr(false).branch(v.type('vm').get('vm-16'), v.type('vm').get('vm-15'))
  .then(console.log, console.error)

  */
/*
v = v.login(username, password).type('vm')
v
  .get('vm-16')
  .each(console.log)
  .then(() => {
    return v.get('vm-16')
  })
  .then(console.log)
  .catch(console.error)
  .finally(() => {
    return v.logout()
  })

  */

// v.expr({ a: 'aye' })('a').then(console.log, console.error)

/*
v = v.login(username, password)

v.type('vm').get('vm-49')('name').default(err => {
  console.log(err)
  return 'ok'
})
  .then(vms => {
    console.log(JSON.stringify(vms, null, '  '))
  }, err => {
    console.error({ err })
  })
  .finally(() => {
    return v.logout()
  })
*/
/*
v.type('vm').nth(0)('name1').then(vms => {
  console.log(JSON.stringify(vms, null, '  '))
})
  .catch(console.error)
  .finally(() => {
    return v.logout()
  })
*/

/*
v.type('datacenter').changes().subscribe(
  change => {
    console.log({change})
  },
  error => {
    console.error({error})
  },
  () => {
    console.log('complete')
  }
)
*/


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
/*
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
*/

/*
let vmr = v.type('datacenter').changes({ interval: 1000 }).then(cursor => {
  cursor.each((err, change) => {
    if (err) return console.error({ err })
    console.log(JSON.stringify(change, null, '  '))
  })
})
*/

/*
vmr.then(res => {
  console.log(JSON.stringify(res, null, '  '))
  // return vmr.pluck('name')
}) */
  /*
  .then(res => {
    console.log({res})
    return vmr.pluck('summary')
  })
  .then(res2 => {
    console.log({res2})
  })
  */
  /*
  .then(() => {
    return v.logout()
  })
  .catch(console.error)
  */