import _ from 'lodash'
import EventEmitter from 'events'
import Promise from 'bluebird'
import PropertyFilterSpec from '../objects/PropertyFilterSpec'
import graphSpec from '../common/graphSpec'
import Debug from 'debug'

const debug = Debug('vconnect.changefeed')

const DEFAULT_INTERVAL_MS = 10000
const CREATED = 'enter'
const UPDATED = 'modify'
const DESTROYED = 'leave'
const CURSOR_DATA = 'cursor.data'
const CURSOR_ERROR = 'cursor.error'

function getId (obj) {
  let moRef = obj.moRef || obj.obj
  return `${_.get(moRef, 'type', 'unknown')}-${_.get(moRef, 'value', 'unknown')}`
}

function formatChange (obj) {
  let val = {
    moRef: obj.obj
  }
  _.forEach(obj.changeSet, change => {
    _.set(val, change.name, change.val)
  })

  return val
}

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
    debug('creating a new changefeed')
    debug('args %O', request.args)
    debug('options %O', request.options)

    let reqArgs = _.cloneDeep(request.args)
    reqArgs.properties = _.without(reqArgs.properties, 'moRef', 'id')

    this._client = client
    this._VimPort = client._VimPort
    this._request = request
    this._options = options
    this._reqArgs = reqArgs
    this._interval = null
    this._emitter = new EventEmitter()


    this._waitMethod = this._VimPort.WaitForUpdatesEx
      ? 'WaitForUpdatesEx'
      : 'WaitForUpdates'

    debug('using method %s', this._waitMethod)

    let intervalMS = _.get(options, 'interval')
    this._intervalMS = _.isNumber(intervalMS)
      ? Math.ceil(intervalMS)
      : DEFAULT_INTERVAL_MS

    debug('using interval %d', this._intervalMS)

    this.collector = {}
    this.version = ''
    this.currentVal = {}
    this.updating = false
  }

  create () {
    let specMap = _.map(graphSpec(this._reqArgs), s => PropertyFilterSpec(s, this._client).spec)
    let _this = this._client.serviceContent.propertyCollector

    return Promise.all(specMap)
      .then(specSet => {
        debug('specMap %j', specSet)
        return this._client.method('CreatePropertyCollector', { _this })
          .then(_this => {
            this.collector = _this
            return Promise.each(specSet, spec => {
              return this._client.method('CreateFilter', { _this, spec, partialUpdates: false })
            })
          })
      })
      .then(() => {
        return this.update().then(() => {
          this._interval = setInterval(() => {
            this.update()
          }, this._intervalMS)
          return new Cursor(this._emitter)
        })
      })
  }

  diff (set, firstRun) {
    let objectSet = _.get(set, 'filterSet[0].objectSet')

    if (firstRun) {
      _.forEach(objectSet, obj => {
        this.currentVal[getId(obj)] = formatChange(obj)
      })
    } else {
      let creates = {}
      let destroys = []
      let updates = {}

      let changes = _.map(objectSet, obj => {
        let id = getId(obj)
        let change = {
          old_val: null,
          new_val: null
        }

        if (obj.kind === CREATED) {
          change.new_val = formatChange(obj)
          _.set(creates, id, change.new_val)
        } else {
          let newVal = _.cloneDeep(_.get(this.currentVal, id, {}))
          change.old_val = _.cloneDeep(newVal)

          if (obj.kind === DESTROYED) {
            destroys.push(id)
          } else if (obj.kind === UPDATED) {
            _.forEach(obj.changeSet, ({ name, op, val }) => {
              switch (op) {
                case 'add':
                  _.set(newVal, name, val)
                  break
                case 'remove':
                  _.unset(newVal, name, val)
                  break
                case 'assign':
                  _.set(newVal, name, val)
                  break
                case 'indirectRemove':
                  _.unset(newVal, name, val)
                  break
                default:
                  break
              }
            })
            _.set(updates, id, newVal)
            change.new_val = newVal
          } else {
            debug('unhandled kind %s', obj.kind)
          }
        }

        return change
      })

      // add creates
      _.forEach(creates, (change, id) => {
        _.set(this.currentVal, id, change)
      })

      // set updates
      _.forEach(updates, (change, id) => {
        _.set(this.currentVal, id, change)
      })

      // remove destroyed
      _.forEach(destroys, id => {
        _.unset(this.currentVal, id)
      })

      return changes
    }
  }

  update () {
    if (this.updating) return // prevent concurrent calls to update
    this.updating = true
    return this._client.method(this._waitMethod, {
      _this: this.collector,
      version: this.version,
      options: {
        maxWaitSeconds: 0
      }
    })
      .then(set => {
        this.updating = false
        if (!set) return
        this.version = set.version

        if (this.version === '1') {
          if (_.isEmpty(this.currentVal)) this.diff(set, true)
        } else {
          _.forEach(this.diff(set), change => {
            this._emitter.emit(CURSOR_DATA, change)
          })
        }
      }, error => {
        this._emitter.emit(CURSOR_ERROR, error)
        this.updating = false
      })
  }
}