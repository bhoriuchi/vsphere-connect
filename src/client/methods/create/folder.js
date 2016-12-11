import Promise from 'bluebird'
import { errorHandler, resultHandler } from '../../utils/index'

export default function createFolder (args, options, callback) {
  return new Promise((resolve, reject) => {
    let { folder, name } = args
    if (!name) return errorHandler(new Error('create folder requires name'), callback, reject)
    folder = folder ? { type: 'Folder', value: folder } : this.serviceContent.rootFolder
    return this.method('CreateFolder', { _this: folder, name }, (err, result) => {
      if (err) return errorHandler(err, callback, reject)
      return resultHandler(result, callback, resolve)
    })
  })
}