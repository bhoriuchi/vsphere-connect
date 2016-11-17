import _ from 'lodash'
import { makeDotPath } from './common'

export default function query (q) {
  let [ idx, val, breakLoop, type, props ] = [ 0, null, false, null, [] ]
  let [ chain, len, client ] = [ q._chain, q._chain.length, q._client ]

  for (let c of chain) {
    switch (c.method) {
      case 'logout':
        val = client.logout()
        breakLoop = true
        break

      case 'type':
        type = c.name
        break

      case 'pluck':
        props = []
        _.forEach(c.args, (arg) => {
          if (_.isString(arg)) {
            props = _.union(props, [arg])
          } else if (_.isArray(arg)) {
            props = _.union(props, arg)
          } else if (_.isObject(arg)) {
            props = _.union(props, makeDotPath(arg))
          }
        })
        break

      default:
        break
    }
    if (breakLoop) return val
    idx++
  }
  return val
}