import _ from 'lodash'
import Promise from 'bluebird'
import monitor from '../monitor/index'
import { isMoRef } from '../common/moRef'
import { CreateVirtualMachineArgs } from '../spec/VirtualMachine'

/**
 *
 * @param parent {String|Object} - parent path or moref
 * @param type
 * @param config
 * @param options
 * @returns {*|Promise.<*>|Promise.<TResult>}
 */
export default function create (type, config, options) {
  try {
    type = this.typeResolver(type)

    switch (type) {
      case 'VirtualMachine':
        if (_.isFunction(config)) {
          let vmArgs = new CreateVirtualMachineArgs(this)
          config(vmArgs)
          return vmArgs._args
        } else {
          return Promise.resolve(config)
        }

      default:
        throw new Error(`"${type}" is not supported in create operation`)
    }

    let args = this.createSpec(moRef, type, config, options)
    return args




  } catch (err) {
    return Promise.reject(err)
  }
}