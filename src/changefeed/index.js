import _ from 'lodash'
import EventEmitter from 'events'
import Promise from 'bluebird'
import PropertyFilterSpec from '../objects/PropertyFilterSpec'
import graphSpec from '../common/graphSpec'

const DEFAULT_INTERVAL_MS = 10000

export class Cursor {
  constructor (emitter, interval) {
    this.close = () => {
      emitter.removeAllListeners()
      clearInterval(interval)
    }

    this.each = (handler) => {
      emitter.on('cursor.data', data => handler(undefined, data))
      emitter.on('cursor.error', err => handler(err))
    }
  }
}

export default class ChangeFeed {
  constructor (client, request, options) {
    this._client = client
    this._VimPort = client._VimPort
    this._request = request
    this._options = options
    this._request = request
    this._interval = null
    this._emitter = new EventEmitter()

    this._waitMethod = this._VimPort.WaitForUpdatesEx
      ? 'WaitForUpdatesEx'
      : 'WaitForUpdates'

    let intervalMS = _.get(options, 'interval')
    this._intervalMS = _.isNumber(intervalMS)
      ? Math.ceil(intervalMS)
      : DEFAULT_INTERVAL_MS

    this.collector = {}
    this.version = ''
  }

  create () {
    let specMap = _.map(graphSpec(this._request.args), s => PropertyFilterSpec(s, this._client).spec)
    let _this = this._client.serviceContent.propertyCollector

    return Promise.all(specMap)
      .then(specSet => {
        return this._client.method('CreatePropertyCollector', { _this })
          .then(_this => {
            this.collector = _this
            return Promise.each(specSet, spec => {
              return this._client.method('CreateFilter', { _this, spec, partialUpdates: false })
            })
          })
      })
      .then(() => {
        this._interval = setInterval(this.update, this._intervalMS)
        return new Cursor(this._emitter)
      })
  }

  update () {
    return this._client.method(this._waitMethod, {
      _this: this.collector,
      version: this.version,
      options: {
        maxWaitSeconds: 0
      }
    })
      .then(set => {
        if (!set) return
        this._emitter.emit('cursor.data', set)
      }, error => {
        this._emitter.emit('cursor.error', error)
      })
  }
}