import _ from 'lodash'
import Promise from 'bluebird'

export default function createCluster (args, options) {
  let { folder, name, spec } = _.isObject(args) ? args : {}
  let _this = folder ? { type: 'Folder', value: folder } : this.serviceContent.rootFolder
  spec = _.isObject(spec) ? spec : {}
  options = _.isObject(options) ? options : {}

  return name
    ? this.method('CreateClusterEx', { _this, name, spec })
    : Promise.reject(new Error('create datacenter requires a name'))
}