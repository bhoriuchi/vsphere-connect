import _ from 'lodash';
import Rx from 'rxjs';
import EventEmitter from 'events';
import Promise from 'bluebird';
import PropertyFilterSpec from './objects/PropertyFilterSpec';
import graphSpec from './common/graphSpec';
import Debug from 'debug';

const debug = Debug('vconnect.changefeed');

const DEFAULT_INTERVAL_MS = 10000;
const CREATED = 'enter';
const UPDATED = 'modify';
const DESTROYED = 'leave';
const CHANGE = 'change';

function getId(obj) {
  const moRef = obj.moRef || obj.obj;
  const type = _.get(moRef, 'type', 'unknown');
  const id = _.get(moRef, 'value', 'unknown');
  return `${type}-${id}`;
}

function formatChange(obj) {
  const val = {
    moRef: obj.obj,
  };
  _.forEach(obj.changeSet, change => {
    _.set(val, change.name, change.val);
  });

  return val;
}

export default class ChangeFeed {
  constructor(rb, options) {
    debug('creating a new changefeed');
    debug('args %O', rb.args);
    debug('options %O', rb.options);

    this._client = rb.client;
    this._request = rb;
    this._options = options;
    this._interval = null;
    this._emitter = new EventEmitter();
    this._observable = Rx.Observable.fromEvent(this._emitter, CHANGE).finally(
      () => {
        this.close();
      },
    );

    debug('using method %s', this._waitMethod);

    const intervalMS = _.get(options, 'interval');
    this._intervalMS = _.isNumber(intervalMS)
      ? Math.ceil(intervalMS)
      : DEFAULT_INTERVAL_MS;

    debug('using interval %d', this._intervalMS);

    this.collector = {};
    this.version = '';
    this.currentVal = {};
    this.updating = false;
  }

  close() {
    this._emitter.removeAllListeners();
    clearTimeout(this._interval);
  }

  create() {
    this._request.term.then(() => {
      const reqArgs = _.cloneDeep(this._request.args) || {};
      if (this._request.allData) reqArgs.properties = [];
      reqArgs.properties = reqArgs.properties || ['moRef', 'name'];
      reqArgs.properties = _.without(reqArgs.properties, 'moRef', 'id');
      const specMap = _.map(graphSpec(reqArgs), s => {
        return PropertyFilterSpec(s, this._client).spec;
      });
      const _this = this._client.serviceContent.propertyCollector;
      this._VimPort = this._client._VimPort;
      this._waitMethod = this._VimPort.WaitForUpdatesEx
        ? 'WaitForUpdatesEx'
        : 'WaitForUpdates';

      return Promise.all(specMap)
        .then(specSet => {
          debug('specMap %j', specSet);
          return this._client
            .method('CreatePropertyCollector', { _this })
            .then(collector => {
              this.collector = collector;
              return Promise.each(specSet, spec => {
                return this._client.method('CreateFilter', {
                  _this: collector,
                  spec,
                  partialUpdates: false,
                });
              });
            });
        })
        .then(() => {
          return this.update().then(() => {
            this._interval = setInterval(() => {
              this.update();
            }, this._intervalMS);
          });
        });
    });

    return this._observable;
  }

  diff(set, firstRun) {
    const objectSet = _.get(set, 'filterSet[0].objectSet');

    if (firstRun) {
      _.forEach(objectSet, obj => {
        this.currentVal[getId(obj)] = formatChange(obj);
      });
    } else {
      const creates = {};
      const destroys = [];
      const updates = {};

      const changes = _.map(objectSet, obj => {
        const id = getId(obj);
        const change = {};
        change['old_val'] = null;
        change['new_val'] = null;

        if (obj.kind === CREATED) {
          change['new_val'] = formatChange(obj);
          _.set(creates, id, change.new_val);
        } else {
          const newVal = _.cloneDeep(_.get(this.currentVal, id, {}));
          change['old_val'] = _.cloneDeep(newVal);

          if (obj.kind === DESTROYED) {
            destroys.push(id);
          } else if (obj.kind === UPDATED) {
            _.forEach(obj.changeSet, ({ name, op, val }) => {
              switch (op) {
                case 'add':
                  _.set(newVal, name, val);
                  break;
                case 'remove':
                  _.unset(newVal, name, val);
                  break;
                case 'assign':
                  _.set(newVal, name, val);
                  break;
                case 'indirectRemove':
                  _.unset(newVal, name, val);
                  break;
                default:
                  break;
              }
            });
            _.set(updates, id, newVal);
            change['new_val'] = newVal;
          } else {
            debug('unhandled kind %s', obj.kind);
          }
        }

        return change;
      });

      // add creates
      _.forEach(creates, (change, id) => {
        _.set(this.currentVal, id, change);
      });

      // set updates
      _.forEach(updates, (change, id) => {
        _.set(this.currentVal, id, change);
      });

      // remove destroyed
      _.forEach(destroys, id => {
        _.unset(this.currentVal, id);
      });

      return changes;
    }
  }

  update() {
    if (this.updating) return; // prevent concurrent calls to update
    this.updating = true;
    debug('update running');
    return this._client
      .method(this._waitMethod, {
        _this: this.collector,
        version: this.version,
        options: {
          maxWaitSeconds: 0,
        },
      })
      .then(
        set => {
          this.updating = false;
          if (!set) return;
          this.version = set.version;

          if (this.version === '1') {
            if (_.isEmpty(this.currentVal)) this.diff(set, true);
          } else {
            _.forEach(this.diff(set), change => {
              this._emitter.emit(CHANGE, change);
            });
          }
        },
        error => {
          this._emitter.emit(CHANGE, error);
          this.updating = false;
        },
      );
  }
}
