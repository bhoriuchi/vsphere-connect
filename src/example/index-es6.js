import VSphere from '../client/index'
import cred from '../../credentials'
let { host, user, pass } = cred

let start = Date.now()

VSphere(host, { ignoreSSL: true }).then((client) => {
  console.log('Runn took', (Date.now() - start) / 1000, 'seconds')
})
