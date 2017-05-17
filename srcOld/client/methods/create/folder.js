import _ from 'lodash'
import Promise from 'bluebird'

export default function createFolder (args, options) {
  let { folder, name } = _.isObject(args) ? args : {}
  let _this = folder ? { type: 'Folder', value: folder } : this.serviceContent.rootFolder
  options = _.isObject(options) ? options : {}

  if (!name) return Promise.reject(new Error('create folder requires name'))

  return this.method('CreateFolder', { _this, name })
}