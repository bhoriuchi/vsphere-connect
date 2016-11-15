import _ from 'lodash'
import mo from './mo'

export default function propertySpec (objs) {
  objs = _.isArray(objs) ? objs : [objs]

  return Promise.all(_.map(objs, (obj) => {
    let [ type, container, recursive, args, resolveView ] = [ null, null, null, null, Promise.resolve(null) ]

    if (_.isString(obj)) {
      type       = obj
      container  = client.serviceContent.rootFolder
      recursive  = true
      args       = {}
    } else if (!obj.type) {
      return Promise.reject('Missing required argument "type"')
    }

    type = type || obj.type
    container = container || obj.container || this.serviceContent.rootFolder
    recursive = (obj.recursive === false) ? false : true

    let listSpec = _.get(mo, `["${this.apiVersion}"]["${type}"].listSpec`)
    if (!listSpec && !obj.id) return Promise.reject('Unable to list vSphere type, try with a specific object id')

    // get the container view if no object specified
    // this is used for listing entire collections of object types
    if (!obj.id && listSpec.type === 'ContainerView') {
      resolveView = this.method('CreateContainerView', {
        _this: this.serviceContent.viewManager,
        container,
        type,
        recursive
      })
    }

    return resolveView.then()

  }))
}