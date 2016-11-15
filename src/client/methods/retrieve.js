import _ from 'lodash'
import { moRef } from '../common'

export default function retrieve (args = {}, callback = () => false) {
  let retrieveProperties = this._VimPort.RetrievePropertiesEx ? 'RetrievePropertiesEx' : 'RetrieveProperties'

  let payload = {
    _this: this.serviceContent.propertyCollector,
    specSet: [],
    options: {
      maxObjects: args.maxObjects
    }
  }

  payload.specSet = _.map(args.objects, (obj) => {
    if (_.isString(obj)) {

    }
  })

}

/*
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
  */