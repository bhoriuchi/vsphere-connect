import _ from 'lodash'
import Promise from 'bluebird'
import { semver } from '../../utils/index'
import monitor from '../../monitor/index'

export default function createDVSwitch (args, options) {
  let { folder, datacenter, spec } = _.isObject(args) ? args : {}
  options = _.isObject(options) ? options : {}

  if (semver.lt(this.apiVersion, '4.0')) return Promise.reject(new Error('create dvSwitch requires api 4.0 or higher'))
  if (!spec) return Promise.reject(new Error('create dvSwitch requires a spec'))

  if (folder) {
    folder = Promise.resolve({ type: 'Folder', value: folder })
  }

  else if (datacenter) {
    folder = this.retrieve({
      type: 'Datacenter',
      id: datacenter,
      properties: ['networkFolder']
    })
      .then(dc => _.get(dc, 'networkFolder'))
  }

  else {
    return Promise.reject(new Error('datacenter or folder required to create dvSwitch'))
  }

  return folder.then(folderRef => {
    return this.method('CreateDVS_Task', { _this: folderRef, spec })
      .then(task => {
        return (options.async !== false)
          ? task
          : monitor.task(this, _.get(task, 'value'), options)
      })
  })
}