import Promise from 'bluebird'
import { errorHandler, resultHandler, semver } from '../../utils/index'

export default function createStoreCluster (args, options, callback) {
  return new Promise((resolve, reject) => {
    if (semver.lt(this.apiVersion, '5.0')) {
      return errorHandler(new Error('create datastore cluster requires api 5.0 or higher'), callback, reject)
    }
    let { folder, name } = args
    if (!name) return errorHandler(new Error('create folder requires name'), callback, reject)
    folder = folder ? { type: 'Folder', value: folder } : this.serviceContent.rootFolder
    return this.method('CreateStoragePod', { _this: folder, name }, (err, result) => {
      if (err) return errorHandler(err, callback, reject)
      return resultHandler(result, callback, resolve)
    })
  })
}