import _ from 'lodash'
import { errorHandler, resultHandler, semver } from '../../utils/index'
import monitor from '../../monitor/index'

export default function createDVSwitch (args, options, callback) {
  return new Promise((resolve, reject) => {
    if (semver.lt(this.apiVersion, '4.0')) {
      return errorHandler(new Error('create dvSwitch requires api 4.0 or higher'), callback, reject)
    }
    let { folder, datacenter, spec } = args
    if (!spec) return errorHandler(new Error('create dvSwitch requires a spec'), callback, reject)

    if (folder) {
      folder = Promise.resolve({ type: 'Folder', value: folder })
    } else if (datacenter) {
      folder = this.retrieve({
        type: 'Datacenter',
        id: datacenter,
        properties: ['networkFolder']
      })
        .then((dc) => _.get(dc, 'networkFolder'))
        .catch((err) => {
          return errorHandler(err, callback, reject)
        })
    } else {
      return errorHandler(new Error('datacenter or folder required to create dvSwitch'), callback, reject)
    }

    return folder.then((folderRef) => {
      return this.method('CreateDVS_Task', { _this: folderRef, spec }, (err, result) => {
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