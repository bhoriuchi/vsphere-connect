/*
 * cacheKey function to allow re-use of cache on same api version and type
 */
import _ from 'lodash'

const SI_XML = `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body xmlns:vim25="urn:vim25">
    <vim25:RetrieveServiceContent>
      <vim25:_this type="ServiceInstance">ServiceInstance</vim25:_this>
    </vim25:RetrieveServiceContent>
  </soapenv:Body>
</soapenv:Envelope>`

export default function cacheKey (tools, wsdl, done) {
  let { request, xmldom } = tools
  let url = wsdl.replace(/.wsdl.*$/, '')
  let headers = { 'Content-Type': 'text/xml', 'Content-Length': SI_XML.length }
  request.post({ headers, url, body: SI_XML }, (err, res, body) => {
    try {
      if (err) return done(err)
      let doc = new xmldom.DOMParser().parseFromString(body)
      let apiType = _.get(doc.getElementsByTagName('apiType'), '[0].textContent')
      let apiVersion = _.get(doc.getElementsByTagName('apiVersion'), '[0].textContent')
      if (apiType && apiVersion) return done(null, `VMware-${apiType}-${apiVersion}`)
      return done(null, null)
    } catch (err) {
      return done(null, null)
    }
  })
}