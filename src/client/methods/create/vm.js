import _ from 'lodash'
import Promise from 'bluebird'
import monitor from '../../monitor/index'

export default function createVM (args, options) {
  let { folder, datacenter, config, pool, host } = _.isObject(args) ? args : {}

  if (!config) return Promise.reject(new Error('create vm requires a config'))

  if (folder) {
    folder = Promise.resolve({ type: 'Folder', value: folder })
  }

  else if (datacenter) {
    folder = this.retrieve({
      type: 'Datacenter',
      id: datacenter,
      properties: ['vmFolder']
    })
      .then(dc => _.get(dc, 'vmFolder'))
  }

  else {
    return Promise.reject(new Error('datacenter or folder required to create vm'))
  }

  return folder.then(folderRef => {
    return this.method('CreateVM_Task', { _this: folderRef, config, pool, host })
      .then(task => {
        return (options.async !== false)
          ? task
          : monitor.task(this, _.get(task, 'value'), options)
      })
  })
}