import request from 'request'
import cred from '../../credentials'
import xmldom from 'xmldom'
import _ from 'lodash'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const REQUEST_BODY = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns="urn:vim25" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
<soapenv:Header/>
<soapenv:Body>
  <RetrieveServiceContent>
    <_this>ServiceInstance</_this>
  </RetrieveServiceContent>
</soapenv:Body>
</soapenv:Envelope>`

function xmlObj2Json (obj) {
  let j = {}
  let attrs = _.map(obj.attributes, (attr) => ({ [attr.name || attr.nodeName]: attr.value || attr.nodeValue}))
  if (attrs.length) j.$attributes = attrs
  _.forEach(obj.childNodes, (el) => {
    let tag = el.tagName || el.target
    let data = el.data || el.nodeValue || ''

    if (data.replace(/\s*/) !== '') {
      if (el.childNodes) {
        j[tag] = xmlObj2Json(el)
      } else if (attrs.length) {
        j.$value = data
      } else {
        j[tag] = data
      }
    }
  })
  return j
}


function get () {
  request.post({
    headers: {
      'Content-Type': 'text/xml',
      'Content-Length': REQUEST_BODY.length
    },
    url: `https://${cred.host}/sdk/vimService`,
    body: REQUEST_BODY
  }, (err, res, body) => {
    if (err) return console.error(err)
    let doc = new xmldom.DOMParser().parseFromString(body)
    console.log(JSON.stringify(xmlObj2Json(doc), null, '  '))
  })
}

get()