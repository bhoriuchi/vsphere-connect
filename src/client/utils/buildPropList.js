import _ from 'lodash'
import makeDotPath from './makeDotPath'

export default function buildPropList (args) {
  let props = []
  _.forEach(args, arg => {
    if (_.isString(arg)) props = _.union(props, [arg])
    else if (_.isArray(arg)) props = _.union(props, arg)
    else if (_.isObject(arg)) props = _.union(props, makeDotPath(arg))
  })
  return props
}