import _ from 'lodash'
import Promise from 'bluebird'
import monitor from '../monitor/index'
import MoRef from '../common/moRef'

export default function rename (moRef, name, options) {
  if (!_.isString(name)) {
    return Promise.reject(
      new Error('missing name parameter in rename operation')
    )
  }
  try {
    return this.method('Rename_Task', {
      _this: MoRef(moRef),
      newName: name
    })
      .then(task => {
        return _.get(options, 'async') === false
          ? monitor.task(this, _.get(task, 'value'), options)
          : task
      })
  } catch (error) {
    return Promise.reject(error)
  }
}
