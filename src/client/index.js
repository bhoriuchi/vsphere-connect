import _ from 'lodash'
import { soap } from 'strong-soap'
import path from 'path'
import 'json-js'
import fs from 'fs'
import urlencode from 'urlencode'
import LocalStorage from 'node-localstorage'

export const BASE_DIR = path.resolve(__dirname.replace(/^(.*\/vsphere-connect)(.*)$/, '$1'))

export function readCache (storage, key) {
  key = urlencode(key)
  try {
    let cache = fs.readFileSync(path.resolve(`${BASE_DIR}/WSDL_CACHE/${key}`), 'utf8')
    // let cache = storage.getItem(key)
    if (!cache) return null
    cache = JSON.retrocycle(JSON.parse(cache))
    return cache
  } catch (err) {
    return null
  }
}

export function writeCache (storage, key, cache) {
  key = urlencode(key)
  fs.writeFileSync(path.resolve(`${BASE_DIR}/WSDL_CACHE/${key}`), JSON.stringify(JSON.decycle(cache)))
  //storage.setItem(key, JSON.stringify(JSON.decycle(cache)))
}

export class VSphereClient {
  constructor (host, options = {}) {
    if (!host) throw new Error('No host specified')

    this._host = host
    this._options = options
    this._endpoint = `https://${this._host}/sdk/vimService`
    this._wsdl = `${this._endpoint}.wsdl`

    let localStorage = new LocalStorage.LocalStorage(path.resolve(`${BASE_DIR}/WSDL_CACHE`))

    let soapOptions = {
      endpoint: this._endpoint
    }

    let WSDL_CACHE = readCache(localStorage, this._wsdl)
    if (WSDL_CACHE) soapOptions.WSDL_CACHE = WSDL_CACHE

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    soap.createClient(this._wsdl, soapOptions, (err, client) => {
      if (err) throw err
      this._soapClient = client

      if (!WSDL_CACHE) writeCache(localStorage, this._wsdl, client.wsdl.WSDL_CACHE)

      this._soapClient.RetrieveServiceContent({
        '_this': 'ServiceInstance'
      }, (err, result) => {
        if (err) throw err
        console.log(result)
      })
    })
  }
}

// convenience method to create a new client
export default function (host, options = {}) {
  return new VSphereClient(host, options)
}