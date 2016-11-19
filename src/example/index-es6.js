import chalk from 'chalk'
import VSphere from '../client/index'
import cred from '../../credentials'
let { host, username, password } = cred
import { XS } from '../client/const'
import _ from 'lodash'
let start = Date.now()

import { buildMessage } from '../client/types'

let v = VSphere(host, { username, password, ignoreSSL: true })

v.client().then((client) => {
  client._soapClient.on('message', (body) => {
    console.log(body)
  })
  // console.log(client._types['urn:vim25'].RetrievePropertiesExRequestType)

  // console.log(client._soapClient.wsdl.definitions.schemas['urn:vim25'].complexTypes.SelectionSpec.descriptor.inheritance.TraversalSpec)
  // process.exit()

  let pl1 = {
    _this: 'ServiceInstance'
  }

  let pl2 = {
    _this: client.serviceContent.propertyCollector,
    specSet: [
      {
        objectSet: [
          {
            obj: {
              $attributes: { type: 'SessionManager' },
              $value: 'SessionManager'
            }
          }
        ],
        propSet: [
          {
            pathSet: ['currentSession', 'sessionList'],
            type: 'SessionManager'
          }
        ]
      }
    ],
    options: {}
  }

  // console.log(JSON.stringify(buildMessage(client._soapClient.wsdl, 'RetrievePropertiesEx', pl2), null, '  '))
  // console.log(JSON.stringify(buildType(defs.schemas, mtype, pl2), null, '  '))
  // console.log(_.keys(s.elements.versionURI))
  // console.log(_.keys(s.elements))

  /*
  return client.method('RetrievePropertiesEx', pl2).then((props) => {
    console.log(JSON.stringify(props, null, '  '))

  })
  */
  return client.retrieve({ type: 'VirtualMachine', properties: ['name', 'id'] }).then((vms) => {
    console.log(vms)

    return client.logout().then(() => {
      console.log('Runn took', (Date.now() - start) / 1000, 'seconds')
    })

    console.log('Runn took', (Date.now() - start) / 1000, 'seconds')
  })
})
  .catch((err) => {
    console.log(chalk.red(JSON.stringify(err, null, '  ')))
  })
