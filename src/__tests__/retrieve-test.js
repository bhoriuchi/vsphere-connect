/* eslint-disable */
import { describe, it } from 'mocha'
import { expect } from 'chai'
import VConnect from '../../dist/index'

// get connection details from the env
const vcenter = process.env.VCONNECT_VCENTER
const user = process.env.VCONNECT_USER
const pass = process.env.VCONNECT_PASSWORD
const ignoreSSL = Boolean(process.env.VCONNECT_IGNORE_SSL)
const v = VConnect(vcenter, { ignoreSSL })

describe('retrieve tests', function () {
  it('gets all vms', function () {
    this.timeout(30000) // timeout for uncached connections

    return v.login(user, pass)
      .type('vm')
      .then(vms => {
        expect(Array.isArray(vms)).to.equal(true)
      })
      .catch(error => {
        v.logout()
        return Promise.reject(error)
      })
      .finally(() => {
        return v.logout()
      })
  })

  it('limits selection results', function () {
    this.timeout(30000)
    const limit = 2
    return v.login(user, pass)
      .type('vm')
      .limit(limit)
      .then(vms => {
        expect(Array.isArray(vms)).to.equal(true)
        expect(vms.length).to.equal(limit)
      })
      .catch(error => {
        v.logout()
        return Promise.reject(error)
      })
      .finally(() => {
        return v.logout()
      })
  })

  it('selects the name of a vm', function () {
    this.timeout(30000)
    return v.login(user, pass)
      .type('vm')
      .limit(1)
      .nth(0)('name')
      .then(name => {
        expect(typeof name === 'string').to.equal(true)
      })
      .catch(error => {
        v.logout()
        return Promise.reject(error)
      })
      .finally(() => {
        return v.logout()
      })
  })

  it('gets the child entity of the root folder', function () {
    this.timeout(30000)

    return v.login(user, pass)
    .type('folder')
    .get(v._rb.client.serviceContent.rootFolder.value)
    .pluck('childEntity')('childEntity')
    .then(result => {
      expect(result).to.not.equal(undefined)
    })
    .catch(error => {
      v.logout()
      return Promise.reject(error)
    })
    .finally(() => {
      return v.logout()
    })
  })
})
