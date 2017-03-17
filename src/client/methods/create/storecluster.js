import _ from 'lodash'
import Promise from 'bluebird'
import { semver } from '../../utils/index'

export default function createStoreCluster (args, options) {
  let { folder, name } = _.isObject(args) ? args : {}
  let _this = folder ? { type: 'Folder', value: folder } : this.serviceContent.rootFolder
  options = _.isObject(options) ? options : {}

  if (!name) return Promise.reject(new Error('create folder requires name'))
  if (semver.lt(this.apiVersion, '5.0')) return Promise.reject(new Error('storecluster requires api 5.0 or higher'))

  return this.method('CreateStoragePod', { _this, name })
}