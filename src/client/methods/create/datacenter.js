import { errorHandler, resultHandler } from '../../utils/index'

export default function createDatacenter (args, options, callback) {
  return new Promise((resolve, reject) => {
    let { folder, name } = args
    if (!name) return errorHandler(new Error('create datacenter requires name'), callback, reject)
    folder = folder ? { type: 'Folder', value: folder } : this.serviceContent.rootFolder
    return this.method('CreateDatacenter', { _this: folder, name }, (err, result) => {
      if (err) return errorHandler(err, callback, reject)
      return resultHandler(result, callback, resolve)
    })
  })
}