import { errorHandler, resultHandler } from '../../utils/index'

export default function createCluster (args, options, callback) {
  return new Promise((resolve, reject) => {
    let { folder, name, spec } = args
    if (!name) return errorHandler(new Error('create datacenter requires name'), callback, reject)
    folder = folder ? { type: 'Folder', value: folder } : this.serviceContent.rootFolder
    spec = spec || {}
    return this.method('CreateClusterEx', { _this: folder, name, spec }, (err, result) => {
      if (err) return errorHandler(err, callback, reject)
      return resultHandler(result, callback, resolve)
    })
  })
}