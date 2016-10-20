import _ from 'lodash'
import soap from 'soap'
import path from 'path'
import LocalStorage from 'node-localstorage'

export const BASE_DIR = path.resolve(__dirname.replace(/^(.*\/vsphere-connect)(.*)$/, '$1'))

export function circular (obj, value = '[Circular]') {
  let circularEx = (_obj, key = null, seen = [], path = '') => {
    seen.push(_obj)
    if (_.isObject(_obj)) {
      _.forEach(_obj, (o, i) => {
        let pathStr = _.isArray(_obj) ? `[${i}]` : `.${i}`
        if (_.includes(seen, o)) _obj[i] = _.isFunction(value) ? value(_obj, key, seen.slice(0), path) : value
        else circularEx(o, i, seen.slice(0), `${path}${pathStr}`)
      })
    }
    return _obj
  }

  if (!obj) throw new Error('circular requires an object to examine')
  return circularEx(obj, value)
}

export function reconnectWSDL (root, current) {
  if (_.isObject(current)) {
    _.forEach(current, (v, k) => {
      if (k === 'WSDL_CACHE' && v === '[Circular]') current[k] = root
      else if (_.isObject(v)) reconnectWSDL(root, v)
    })
  }
  return root
}

export class VSphereClient {
  constructor (host, options = {}) {
    if (!host) throw new Error('No host specified')

    this._host = host
    this._options = options
    this._endpoint = `https://${host}/sdk/vimService`
    this._wsdl = `${this._endpoint}.wsdl`

    let localStorage = new LocalStorage.LocalStorage(path.resolve(`${BASE_DIR}/WSDL_CACHE`))
    let WSDL_CACHE = localStorage.getItem(this._wsdl)

    let soapOptions = {
      forceSoap12Headers: false,
      endpoint: this._endpoint
    }

    /*
    if (WSDL_CACHE) {
      let cache = JSON.parse(WSDL_CACHE)
      soapOptions.WSDL_CACHE = reconnectWSDL(cache, cache)
    }
    */

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    soap.createClient(this._wsdl, soapOptions, (err, client) => {
      if (err) throw err
      this._soapClient = client

      _.forEach(_.get(client, 'wsdl.definitions.messages'), function(msg) {
        msg.$name = msg.$name.replace(/RequestMsg$/, '');
      })

      if (!WSDL_CACHE) localStorage.setItem(this._wsdl, JSON.stringify(circular(client.wsdl.WSDL_CACHE), null, ' '))

      this._soapClient.VimService.VimPort.RetrieveServiceContent({
        '_this': 'ServiceInstance'
      }, (err, result) => {
        if (err) throw err
        // console.log(result)
      })
    })
  }
}

// convenience method to create a new client
export default function (host, options = {}) {
  return new VSphereClient(host, options)
}