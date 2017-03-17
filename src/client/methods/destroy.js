import _ from 'lodash'
import Promise from 'bluebird'
import monitor from '../monitor/index'

export default function destroy (args = {}, options) {
  options = _.isObject(options) ? options : {}
  let { type, id, moRef } = args
  let typeName = this.typeResolver(type)
  let obj = moRef || { type: typeName, value: id }

  if (!moRef && !type && !id) return Promise.reject(new Error('no object specified to destroy'))

  return this.method('Destroy_Task', { _this: obj })
    .then(task => {
      return (options.async !== false)
        ? task
        : monitor.task(this, _.get(task, 'value'), options)
    })
}