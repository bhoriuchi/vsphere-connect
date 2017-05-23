import _ from 'lodash'

export default function convertRetrievedProperties (results, moRef) {
  let objs = _.get(results, 'objects') || _.get(results, 'returnval.objects')

  return _.map(_.isArray(objs) ? objs : [], result => {
    let obj = moRef ? { moRef: result.obj } : {}
    _.forEach(result.propSet, prop => {
      _.set(obj, prop.name, prop.val)
    })
    return obj
  })
}