/*
 * cacheKey function to allow re-use of cache on same api version and type
 */
import _ from 'lodash'
const REQUEST_TIMEOUT = 2000

const SI_XML = `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body xmlns:vim25="urn:vim25">
    <vim25:RetrieveServiceContent>
      <vim25:_this type="ServiceInstance">ServiceInstance</vim25:_this>
    </vim25:RetrieveServiceContent>
  </soapenv:Body>
</soapenv:Envelope>`

export default function cacheKey (tools, wsdl, done) {
  const { request, xmldom } = tools
  const url = wsdl.replace(/.wsdl.*$/, '')
  const headers = {
    'Content-Type': 'text/xml',
    'Content-Length': SI_XML.length
  }

  request.post(
    { headers, url, body: SI_XML, timeout: REQUEST_TIMEOUT },
    (err, res, body) => {
      try {
        if (err) return done(err)
        const doc = new xmldom.DOMParser().parseFromString(body)
        const apiType = _.get(
          doc.getElementsByTagName('apiType'),
          '[0].textContent'
        )
        const apiVersion = _.get(
          doc.getElementsByTagName('apiVersion'),
          '[0].textContent'
        )
        if (apiType && apiVersion) {
          return done(null, `VMware-${apiType}-${apiVersion}`)
        }
        throw new Error('Unable to determine cache key')
      } catch (error) {
        return done(error, null)
      }
    }
  )
}
