import _ from 'lodash'
import { soap } from 'strong-soap'
import path from 'path'
import { getCache, setCache } from './cache'

export const BASE_DIR = path.resolve(__dirname.replace(/^(.*\/vsphere-connect)(.*)$/, '$1'))

export class VSphereClient {
  constructor (host, options, callback) {
    if (!options) {
      options = {}
      callback = () => false
    } else if (_.isFunction(options)) {
      options = {}
      callback = options
    }
    if (!_.isFunction(callback)) callback = () => false

    return new Promise((resolve, reject) => {
      if (!host) throw new Error('No host specified')
      this._host = host
      this._options = options
      this._endpoint = `https://${this._host}/sdk/vimService`
      this._wsdl = `${this._endpoint}.wsdl`

      let cacheFile = getCache(this._wsdl)
      let soapOptions = { endpoint: this._endpoint }

      if (this._options.ignoreSSL) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

      soap.createClient(cacheFile || this._wsdl, soapOptions, (err, client) => {
        if (err) throw err
        this._soapClient = client
        this.WSDL_CACHE = client.wsdl.WSDL_CACHE

        // retrieve service content
        this._soapClient.RetrieveServiceContent({
          '_this': 'ServiceInstance'
        }, (err, result) => {
          if (err) {
            callback(err)
            return reject(err)
          }
          this.serviceContent = result.returnval
          this.apiVersion = _.get(this.serviceContent, 'about.apiVersion') || _.get(this.serviceContent, 'about.version')
          if (!cacheFile) setCache(this.WSDL_CACHE, this._wsdl, this.apiVersion)
          callback(null, this)
          return resolve(this)
        })
      })
    })
  }
}

// convenience method to create a new client
export default function (host, options = {}) {
  return new VSphereClient(host, options)
}