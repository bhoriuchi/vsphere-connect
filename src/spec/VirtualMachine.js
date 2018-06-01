import _ from 'lodash';
import BaseBuilder from './BaseBuilder';
import Promise from 'bluebird';
// import SpecProxy from './SpecProxy'
import { nicTypeMapper, nicBackingMapper } from '../common/typeMapping';

const INV_PATH_RX = /^(\/.*)\/(host|vm|datastore|network)(\/.*)?$/;

export class CreateVirtualMachineArgs extends BaseBuilder {
  constructor(client) {
    super(client, {});
    this._dcPath = null;
    this._name = null;
    this._datastore = null;
  }

  _this(value) {
    const match = value.match(INV_PATH_RX);
    if (match) this._dcPath = match[1];
    this.$resolveMoRef(value, '_this');
    return this;
  }

  pool(value) {
    let _value = value;
    if (_.isString(_value)) {
      _value = _value
        .replace(new RegExp(`^${this._dcPath}/?`), '')
        .replace(/^host\/?/, '');
      _value = `${this._dcPath}/host/${_value}`;
    }
    this.$resolveMoRef(_value, 'pool');
    return this;
  }

  host(value) {
    let _value = value;
    if (_.isString(_value)) {
      _value = _value
        .replace(new RegExp(`^${this._dcPath}/?`), '')
        .replace(/^host\/?/, '');
      _value = `${this._dcPath}/host/${_value}`;
    }
    this.$resolveMoRef(_value, 'host');
    return this;
  }

  config(spec) {
    this._resolve = this._resolve.then(() => {
      this.$merge(spec);
    });
    return this;
  }

  /*
   * Shortcut methods
   */
  name(value) {
    this._resolve = this._resolve.then(() => {
      this._name = value;
      this.$set('config.name', value);
    });
    return this;
  }

  memory(size) {
    this._resolve = this._resolve.then(() => {
      let mem = 512;
      if (_.isNumber(size)) {
        return this.$set('config.memoryMB', Math.floor(size));
      } else if (_.isString(size)) {
        const match = size.match(/^(\d+)(m|mb|g|gb|t|tb)?$/i);
        if (match && match[1]) {
          mem = Math.floor(Number(match[1]));

          switch (match[2]) {
            case 'm':
            case 'mb':
              return this.$set('config.memoryMB', mem);
            case 'g':
            case 'gb':
              return this.$set('config.memoryMB', mem * 1024);
            case 't':
            case 'tb':
              return this.$set('config.memoryMB', mem * 1024 * 1024);
            default:
              return this.$set('config.memoryMB', mem);
          }
        }
      }
      throw new Error('invalid memory size');
    });
    return this;
  }

  cpus(cores, coresPerSocket) {
    this._resolve = this._resolve.then(() => {
      if (!_.isNumber(cores)) throw new Error('cpu cores must be integer');
      this.$set('config.numCPUs', Math.floor(cores));

      if (this.$versionGTE('5.0.0') && _.isNumber(coresPerSocket)) {
        this.$set('config.coresPerSocket', Math.floor(coresPerSocket));
      }
    });
    return this;
  }

  addNic(network, type, options) {
    const opts = _.isObject(options) ? options : {};
    let _network = network;

    if (_.isString(_network)) {
      _network = _network
        .replace(new RegExp(`^${this._dcPath}/?`), '')
        .replace(/^network\/?/, '');
      _network = `${this._dcPath}/network/${_network}`;
    }
    this._resolve = this._resolve.then(() => {
      // get the network details
      const getMoRef = _.isString(_network)
        ? this.client.moRef(_network)
        : this.$isMoRef(_network)
          ? Promise.resolve(_network)
          : Promise.reject(new Error('invalid moRef supplied for "network"'));

      return getMoRef.then(moRef => {
        return this.client
          .retrieve({
            type: moRef.type,
            id: moRef.value,
            properties:
              moRef.type === 'DistributedVirtualPortgroup'
                ? ['name', 'config.distributedVirtualSwitch']
                : ['name'],
          })
          .then(net => {
            const n = _.first(net);
            const netName = _.get(n, 'name', 'VM Network');
            return moRef.type === 'DistributedVirtualPortgroup'
              ? this.client
                  .retrieve({
                    type: _.get(n, 'config.distributedVirtualSwitch.type'),
                    id: _.get(n, 'config.distributedVirtualSwitch.value'),
                    properties: ['uuid'],
                  })
                  .then(dvs => {
                    return {
                      name: netName,
                      uuid: _.get(dvs, '[0].uuid'),
                    };
                  })
              : { name: netName };
          })
          .then(net => {
            if (!_.isArray(this.$get('config.deviceChange'))) {
              this.$set('config.deviceChange', []);
            }
            const key = this.$get('config.deviceChange').length;
            const change = _.merge(
              {
                operation: 'add',
                device: {
                  '@xsi:type': `vim25:${nicTypeMapper(type)}`,
                  backing: {
                    '@xsi:type': `vim25:${nicBackingMapper(moRef.type)}`,
                    deviceName: net.name,
                    useAutoDetect: true,
                    network: moRef,
                    port: net.uuid ? { switchUuid: net.uuid } : undefined,
                  },
                  connectable: {
                    connected: true,
                    startConnected: true,
                    allowGuestControl: true,
                  },
                  deviceInfo: {
                    label: `NetworkAdapter ${key + 1}`,
                    summary: net.name,
                  },
                  key,
                  addressType: 'generated',
                  wakeOnLanEnabled: true,
                  present: true,
                },
              },
              opts,
            );

            this.$push('config.deviceChange', change);
          });
      });
    });

    return this;
  }

  get _args() {
    return this._resolve.then(() => {
      return this.$config();
    });
  }
}
