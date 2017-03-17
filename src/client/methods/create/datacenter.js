import _ from 'lodash'
import Promise from 'bluebird'

export default function createDatacenter (args, options) {
  let { folder, name } = _.isObject(args) ? args : {}
  let _this = folder ? { type: 'Folder', value: folder } : this.serviceContent.rootFolder
  options = _.isObject(options) ? options : {}

  return name
    ? this.method('CreateDatacenter', { _this, name })
    : Promise.reject(new Error('create datacenter requires name'))
}