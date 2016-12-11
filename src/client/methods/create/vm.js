import _ from 'lodash'
import { errorHandler, resultHandler, semver } from '../../utils/index'
import monitor from '../../monitor/index'

export default function createVM (args, options, callback) {
  return new Promise((resolve, reject) => {
    let { folder, datacenter, config, pool, host } = args
    if (!config) return errorHandler(new Error('create vm requires a config'), callback, reject)

    if (folder) {
      folder = Promise.resolve({ type: 'Folder', value: folder })
    } else if (datacenter) {
      folder = this.retrieve({
        type: 'Datacenter',
        id: datacenter,
        properties: ['vmFolder']
      })
        .then((dc) => _.get(dc, 'vmFolder'))
        .catch((err) => {
          return errorHandler(err, callback, reject)
        })
    } else {
      return errorHandler(new Error('datacenter or folder required to create vm'), callback, reject)
    }

    return folder.then((folderRef) => {
      return this.method('CreateVM_Task', { _this: folderRef, config, pool, host }, (err, result) => {
        if (err) return errorHandler(err, callback, reject)
        if (options.async === false) {
          return monitor.task(this, _.get(result, 'value'), options, (err, result) => {
            if (err) return errorHandler(err, callback, reject)
            return resultHandler(result, callback, resolve)
          })
        }
        return resultHandler(result, callback, resolve)
      })
    })
  })
}