import _ from 'lodash'
import request from 'request'
import xmldom from 'xmldom'
import xmlbuilder from 'xmlbuilder'
import serialize from './serialize'
import deserialize from './deserialize'
import Promise from 'bluebird'
import processFault from './fault'
import {
  getEndpointFromPort,
  getFirstChildElement,
  firstNode
} from './utils/index'
import {
  SOAP,
  XS_NS,
  XSI_NS,
  XS_PREFIX,
  XSI_PREFIX,
  SOAPENV_PREFIX,
  SOAPENC_PREFIX
} from './const'

export default function createServices (wsdl) {
  const services = {}
  _.forEach(wsdl.metadata.namespaces, (namespace, nsIdx) => {
    _.forEach(namespace.ports, (port, portIdx) => {
      const soapVars = _.find(SOAP, { version: port.soapVersion })
      _.forEach(port.operations, (_opName, opIdx) => {
        const opPath = `["${port.service}"]["${port.name}"]["${_opName}"]`
        _.set(services, opPath, (data, options) => {
          return new Promise((resolve, reject) => {
            // adding options for future, for now, do a noop
            const opts = _.isObject(options) ? options : {}
            _.noop(opts)

            const endpoint = getEndpointFromPort(this, port)
            const [ input, output ] = wsdl.getOp([ nsIdx, portIdx, opIdx ])
            const soapAction = input.action
            const opName = input.name
            const inputTypePrefix = wsdl.getNSPrefix(input.type)

            const { obj, nsUsed } = serialize(wsdl, input.type, data)

            const envelope = {
              [`@xmlns:${SOAPENV_PREFIX}`]: soapVars.envelope,
              [`@xmlns:${SOAPENC_PREFIX}`]: soapVars.encoding,
              [`@xmlns:${XSI_PREFIX}`]: XSI_NS,
              [`@xmlns:${XS_PREFIX}`]: XS_NS
            }
            const header = {}
            const xmlBody = {}

            _.forEach(_.union(nsUsed, [ inputTypePrefix ]), prefix => {
              xmlBody[`@xmlns:${prefix}`] = wsdl.getNSURIByPrefix(prefix)
            })

            xmlBody[`${inputTypePrefix}:${opName}`] = obj
            envelope[`${SOAPENV_PREFIX}:Header`] = header
            envelope[`${SOAPENV_PREFIX}:Body`] = xmlBody

            const inputXML = xmlbuilder
              .create({ [`${SOAPENV_PREFIX}:Envelope`]: envelope })
              .end({
                pretty: true,
                encoding: this.options.encoding || 'UTF-8'
              })

            const headers = {
              'Content-Type': soapVars.contentType,
              'Content-Length': inputXML.length,
              SOAPAction: soapAction,
              'User-Agent': this.options.userAgent
            }
            this._security.addHttpHeaders(headers)

            const requestObj = { headers, url: endpoint, body: inputXML }
            this.emit('soap.request', requestObj)
            request.post(requestObj, (error, res, body) => {
              if (error) {
                const errResponse = { error, res, body }
                this.emit('soap.error', errResponse)
                return reject(errResponse)
              }
              this.lastResponse = res
              const doc = new xmldom.DOMParser().parseFromString(body)
              const soapEnvelope = firstNode(
                doc.getElementsByTagNameNS(soapVars.envelope, 'Envelope')
              )
              const soapBody = firstNode(
                doc.getElementsByTagNameNS(soapVars.envelope, 'Body')
              )
              const soapFault = firstNode(
                soapBody.getElementsByTagNameNS(soapVars.envelope, 'Fault')
              )
              const xsiPrefix = _.findKey(
                soapEnvelope._nsMap,
                nsuri => nsuri === XSI_NS
              )
              const context = { xsiPrefix }

              if (soapFault) {
                const fault = processFault(wsdl, soapFault, context)
                this.emit('soap.fault', { fault, res, body })
                return reject(fault)
              }

              const result = deserialize(
                wsdl,
                output.type,
                getFirstChildElement(soapBody),
                context
              )
              this.emit('soap.response', { res, body })
              return resolve(result)
            })
          })
        })
      })
    })
  })
  return services
}
