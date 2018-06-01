import _ from 'lodash';
import Promise from 'bluebird';
import monitor from '../monitor/index';

export default function reconfig(moRef, config, options) {
  try {
    const type = this.typeResolver(type);
    const spec = this.updateSpec(moRef, config, options);
    switch (type) {
      case 'VirtualMachine':
        return this.method('ReconfigVM_Task', spec).then(task => {
          return _.get(options, 'async') === false
            ? monitor.task(this, _.get(task, 'value'), options)
            : task;
        });
      default:
        throw new Error(`"${type}" is not supported in update operation`);
    }
  } catch (err) {
    return Promise.reject(err);
  }
}
