import _ from 'lodash'

export default function convertRetrievedProperties (results) {
  let objs = _.get(results, 'objects') || _.get(results, 'returnval.objects')
  return _.map(_.isArray(objs) ? objs : [], (result) => {
    let o = {}
    let { obj, propSet } = result
    o.moRef = obj
    _.forEach(propSet, (prop) => {
      let { name, val } = prop
      _.set(o, name, val)
    })
    return o
  })
}