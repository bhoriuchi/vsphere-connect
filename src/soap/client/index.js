import _ from 'lodash'
import url from 'url'
import EventEmitter from 'events'
import Promise from 'bluebird'
import WSDL from './wsdl/index'
import Security from '../security/index'
import createTypes from './types'
import createServices from './services'
import cacheKey from './utils/cache-key'

const VERSION = '0.1.0'

export class SoapConnectClient extends EventEmitter {
  constructor (wsdlAddress, options) {
    super()
    if (!_.isString(wsdlAddress)) throw new Error('No WSDL provided')
    this.options = _.isObject(options) ? options : {}

    this.options.endpoint = this.options.endpoint
      || url.parse(wsdlAddress).host
    this.options.userAgent = this.options.userAgent
      || `soap-connect/${VERSION}`
    this.types = {}
    this.lastResponse = null
    this._security = new Security.Security()

    if (this.options.ignoreSSL) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    }

    return new Promise((resolve, reject) => {
      return cacheKey(
        this.options.cacheKey,
        wsdlAddress,
        (error, _cacheKey) => {
          if (error) return reject(error)

          return WSDL(wsdlAddress, this.options, _cacheKey)
            .then(wsdlInstance => {
              this.wsdl = wsdlInstance
              this.types = createTypes(wsdlInstance)
              this.services = createServices.call(this, wsdlInstance)
              return resolve(this)
            }, reject)
        })
    })
  }

  setSecurity (security) {
    if (!(security instanceof Security.Security)) {
      throw new Error('Invalid security object')
    }
    this._security = security
  }
}

export default function (mainWSDL, options) {
  return new SoapConnectClient(mainWSDL, options)
}
