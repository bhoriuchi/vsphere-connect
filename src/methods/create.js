import _ from 'lodash';
import Promise from 'bluebird';
// import monitor from '../monitor/index'
// import { isMoRef } from '../common/moRef'
import { CreateVirtualMachineArgs } from '../spec/VirtualMachine';

/**
 * THIS IS A WORK IN PROGRESS
 */

/**
 *
 * @param parent {String|Object} - parent path or moref
 * @param type
 * @param config
 * @param options
 * @returns {*|Promise.<*>|Promise.<TResult>}
 */
export default function create(type, config, options) {
  _.noop(options);
  try {
    const _type = this.typeResolver(type);

    switch (_type) {
      case 'VirtualMachine':
        if (_.isFunction(config)) {
          const vmArgs = new CreateVirtualMachineArgs(this);
          config(vmArgs);
          return vmArgs._args;
        }
        return Promise.resolve(config);
      default:
        throw new Error(`"${type}" is not supported in create operation`);
    }

    // return this.createSpec(moRef, type, config, options)
  } catch (err) {
    return Promise.reject(err);
  }
}
