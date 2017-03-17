import _ from 'lodash'

function pluckProperties (obj, props) {
  let o = {}
  _.forEach(props, prop => {
    _.set(o, prop, _.get(obj, prop))
  })
  return o
}

export default function pluck (obj, props) {
  if (_.isArray(obj)) return _.map(o => pluckProperties(o, props))
  return pluckProperties(obj, props)
}