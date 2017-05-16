import chai from 'chai'
import unitTests from './unit/index'
import credentials from '../credentials'
import VSphere from '../index'

let { host, username, password } = credentials
let v = VSphere(host, { username, password, ignoreSSL: true })

global.chai = chai
global.expect = chai.expect
global.vclient = v

// run tests
describe('vSphere Connect Tests', () => {
  unitTests()
})