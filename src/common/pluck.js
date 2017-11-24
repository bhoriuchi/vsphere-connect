import _ from 'lodash'

function pluckProperties (obj, props) {
  return _.reduce(props, (o, prop) => {
    return _.set(o, prop, _.get(obj, prop))
  }, {})
}

export default function pluck (obj, props) {
  return _.isArray(obj)
    ? _.map(obj, o => pluckProperties(o, props))
    : pluckProperties(obj, props)
}
