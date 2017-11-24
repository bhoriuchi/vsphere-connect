import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import url from 'url'
import xmldom from 'xmldom'
import request from 'request'
import { XS_NS, WSDL_NS } from '../../const'

const HTTP_RX = /^https?:\/\/.+/i
const ERROR_STAUTS = { statusCode: 500 }
const OK_STATUS = { statusCode: 200 }

export default function loadDoc (uri, cache) {
  const encoding = _.get(this, 'options.encoding') || 'utf8'

  if (!_.has(cache, uri)) {
    cache[uri] = {}
    const baseURI = `${uri.substring(0, uri.lastIndexOf('/'))}/`
    const isHTTP = baseURI.match(HTTP_RX)
    this.emit('wsdl.load.start', uri)

    const load = (err, res, body) => {
      if (err || res.statusCode !== 200) {
        return this.emit('wsdl.load.error', err || body || res)
      }
      let address = ''
      const doc = cache[uri] = new xmldom.DOMParser().parseFromString(body)
      const wsdlImports = doc.getElementsByTagNameNS(WSDL_NS, 'import')
      const xsImports = doc.getElementsByTagNameNS(XS_NS, 'import')
      const xsIncludes = doc.getElementsByTagNameNS(XS_NS, 'include')
      _.forEach(_.union(wsdlImports, xsImports, xsIncludes), link => {
        const loc = link.getAttribute('location')
          || link.getAttribute('schemaLocation')
        if (isHTTP) {
          address = url.parse(loc).host ? loc : url.resolve(baseURI, loc)
        } else {
          address = path.resolve(baseURI, loc)
        }
        this.loadDoc(address, cache)
      })
      this.emit('wsdl.load.end', uri)
    }

    if (isHTTP) {
      return request(uri, (err, res, body) => {
        return load(err, res, body)
      })
    }

    // is a file
    try {
      return fs.readFile(uri, encoding, (err, body) => {
        if (err) return load(err, ERROR_STAUTS, body)
        return load(null, OK_STATUS, body)
      })
    } catch (err) {
      return load(err, ERROR_STAUTS, '')
    }
  }
}
